///////////////////////////////////////////////////////////////////////////////////
//-------------------------------------------------------------------------------//
//-------------------------------------------------------------------------------//
//-----------H----H--X----X-----CCCCC----22222----0000-----0000------11----------//
//----------H----H----X-X-----C--------------2---0----0---0----0--1--1-----------//
//---------HHHHHH-----X------C----------22222---0----0---0----0-----1------------//
//--------H----H----X--X----C----------2-------0----0---0----0-----1-------------//
//-------H----H---X-----X---CCCCC-----222222----0000-----0000----1111------------//
//-------------------------------------------------------------------------------//
//----------------------------------------------------- http://hxc2001.free.fr --//
///////////////////////////////////////////////////////////////////////////////////
// File : hxcmod.c
// Contains: a tiny mod player
//
// Written by: Jean François DEL NERO
//
// You are free to do what you want with this code.
// A credit is always appreciated if you include it into your prod :)
//
// This file include some parts of the Noisetracker/Soundtracker/Protracker
// Module Format documentation written by Andrew Scott (Adrenalin Software)
// (modformat.txt)
//
// The core (hxcmod.c/hxcmod.h) is designed to have the least external dependency.
// So it should be usable on almost all OS and systems.
// Please also note that no dynamic allocation is done into the HxCMOD core.
//
// Change History (most recent first):
///////////////////////////////////////////////////////////////////////////////////
// HxCMOD Core API:
// -------------------------------------------
// int  hxcmod_init(modcontext * modctx)
//
// - Initialize the modcontext buffer. Must be called before doing anything else.
//   Return 1 if success. 0 in case of error.
// -------------------------------------------
// int  hxcmod_load( modcontext * modctx, void * mod_data, int mod_data_size )
//
// - "Load" a MOD from memory (from "mod_data" with size "mod_data_size").
//   Return 1 if success. 0 in case of error.
// -------------------------------------------
// void hxcmod_fillbuffer( modcontext * modctx, unsigned short * outbuffer, unsigned long nbsample, tracker_buffer_state * trkbuf )
//
// - Generate and return the next samples chunk to outbuffer.
//   nbsample specify the number of stereo 16bits samples you want.
//   The output format is signed 44100Hz 16-bit Stereo PCM samples.
//   The output buffer size in byte must be equal to ( nbsample * 2 * 2 ).
//   The optional trkbuf parameter can be used to get detailed status of the player. Put NULL/0 is unused.
// -------------------------------------------
// void hxcmod_unload( modcontext * modctx )
// - "Unload" / clear the player status.
// -------------------------------------------
///////////////////////////////////////////////////////////////////////////////////

#include "hxcmod.h"

///////////////////////////////////////////////////////////////////////////////////

// Effects list
#define EFFECT_ARPEGGIO              0x0 // Supported
#define EFFECT_PORTAMENTO_UP         0x1 // Supported
#define EFFECT_PORTAMENTO_DOWN       0x2 // Supported
#define EFFECT_TONE_PORTAMENTO       0x3 // Supported
#define EFFECT_VIBRATO               0x4 // Supported
#define EFFECT_VOLSLIDE_TONEPORTA    0x5 // Supported
#define EFFECT_VOLSLIDE_VIBRATO      0x6 // Supported
#define EFFECT_VOLSLIDE_TREMOLO      0x7 // - TO BE DONE -
#define EFFECT_SET_PANNING           0x8 // - TO BE DONE -
#define EFFECT_SET_OFFSET            0x9 // Supported
#define EFFECT_VOLUME_SLIDE          0xA // Supported
#define EFFECT_JUMP_POSITION         0xB // Supported
#define EFFECT_SET_VOLUME            0xC // Supported
#define EFFECT_PATTERN_BREAK         0xD // Supported

#define EFFECT_EXTENDED              0xE
#define EFFECT_E_FINE_PORTA_UP       0x1 // Supported
#define EFFECT_E_FINE_PORTA_DOWN     0x2 // Supported
#define EFFECT_E_GLISSANDO_CTRL      0x3 // - TO BE DONE -
#define EFFECT_E_VIBRATO_WAVEFORM    0x4 // - TO BE DONE -
#define EFFECT_E_SET_FINETUNE        0x5 // Supported
#define EFFECT_E_PATTERN_LOOP        0x6 // Supported
#define EFFECT_E_TREMOLO_WAVEFORM    0x7 // - TO BE DONE -
#define EFFECT_E_SET_PANNING_2       0x8 // - TO BE DONE -
#define EFFECT_E_RETRIGGER_NOTE      0x9 // Supported
#define EFFECT_E_FINE_VOLSLIDE_UP    0xA // Supported
#define EFFECT_E_FINE_VOLSLIDE_DOWN  0xB // Supported
#define EFFECT_E_NOTE_CUT            0xC // Supported
#define EFFECT_E_NOTE_DELAY          0xD // Supported
#define EFFECT_E_PATTERN_DELAY       0xE // Supported
#define EFFECT_E_INVERT_LOOP         0xF // Supported (W.I.P)
#define EFFECT_SET_SPEED             0xF0 // Supported
#define EFFECT_SET_TEMPO             0xF2 // Supported

#define PERIOD_TABLE_LENGTH  MAXNOTES
#define FULL_PERIOD_TABLE_LENGTH  ( PERIOD_TABLE_LENGTH * 8 )

static const short periodtable[]=
{
	27392, 25856, 24384, 23040, 21696, 20480, 19328, 18240, 17216, 16256, 15360, 14496,
	13696, 12928, 12192, 11520, 10848, 10240,  9664,  9120,  8606,  8128,  7680,  7248,
	 6848,  6464,  6096,  5760,  5424,  5120,  4832,  4560,  4304,  4064,  3840,  3624,
	 3424,  3232,  3048,  2880,  2712,  2560,  2416,  2280,  2152,  2032,  1920,  1812,
	 1712,  1616,  1524,  1440,  1356,  1280,  1208,  1140,  1076,  1016,   960,   906,
	  856,   808,   762,   720,   678,   640,   604,   570,   538,   508,   480,   453,
	  428,   404,   381,   360,   339,   320,   302,   285,   269,   254,   240,   226,
	  214,   202,   190,   180,   170,   160,   151,   143,   135,   127,   120,   113,
	  107,   101,    95,    90,    85,    80,    75,    71,    67,    63,    60,    56,
	   53,    50,    47,    45,    42,    40,    37,    35,    33,    31,    30,    28,
	   27,    25,    24,    22,    21,    20,    19,    18,    17,    16,    15,    14,
	   13,    13,    12,    11,    11,    10,     9,     9,     8,     8,     7,     7
};

static const short sintable[]={
	  0,  24,  49,  74,  97, 120, 141, 161,
	180, 197, 212, 224, 235, 244, 250, 253,
	255, 253, 250, 244, 235, 224, 212, 197,
	180, 161, 141, 120,  97,  74,  49,  24
};

static const muchar InvertLoopTable[]={
	  0,   5,   6,   7,   8,  10,  11, 13,
	 16,  19,  22,  26,  32,  43,  64, 128
};

typedef struct modtype_
{
	unsigned char signature[5];
	int numberofchannels;
}modtype;

modtype modlist[]=
{
	{"M.K.",4},
	{"M!K!",4},
	{"M&K!",4},
	{"PATT",4},
	{"NSMS",4},
	{"LARD",4},
	{"FEST",4},
	{"FIST",4},
	{"N.T.",4},
	{"FLT4",4},
	{"EXO4",4},
	{"OKTA",8},
	{"OCTA",8},
	{"1CHN",1},
	{"01CH",1},
	{"01CN",1},
	{"001C",1},
	{"CD11",1},
	{"FA01",1},
	{"TDZ1",1},
	{"2CHN",2},
	{"02CH",2},
	{"02CN",2},
	{"002C",2},
	{"CD21",2},
	{"FA02",2},
	{"TDZ2",2},
	{"3CHN",3},
	{"03CH",3},
	{"03CN",3},
	{"003C",3},
	{"CD31",3},
	{"FA03",3},
	{"TDZ3",3},
	{"4CHN",4},
	{"04CH",4},
	{"04CN",4},
	{"004C",4},
	{"CD41",4},
	{"FA04",4},
	{"TDZ4",4},
	{"5CHN",5},
	{"05CH",5},
	{"05CN",5},
	{"005C",5},
	{"CD51",5},
	{"FA05",5},
	{"TDZ5",5},
	{"6CHN",6},
	{"06CH",6},
	{"06CN",6},
	{"006C",6},
	{"CD61",6},
	{"FA06",6},
	{"TDZ6",6},
	{"7CHN",7},
	{"07CH",7},
	{"07CN",7},
	{"007C",7},
	{"CD71",7},
	{"FA07",7},
	{"TDZ7",7},
	{"8CHN",8},
	{"08CH",8},
	{"08CN",8},
	{"008C",8},
	{"CD81",8},
	{"FA08",8},
	{"TDZ8",8},
	{"9CHN",9},
	{"09CH",9},
	{"09CN",9},
	{"009C",9},
	{"CD91",9},
	{"FA09",9},
	{"TDZ9",9},
	{"10CH",10},
	{"10CN",10},
	{"010C",10},
	{"11CH",11},
	{"11CN",11},
	{"011C",11},
	{"12CH",12},
	{"12CN",12},
	{"012C",12},
	{"13CH",13},
	{"13CN",13},
	{"013C",13},
	{"14CH",14},
	{"14CN",14},
	{"014C",14},
	{"15CH",15},
	{"15CN",15},
	{"015C",15},
	{"16CH",16},
	{"16CN",16},
	{"016C",16},
	{"17CH",17},
	{"17CN",17},
	{"017C",17},
	{"18CH",18},
	{"18CN",18},
	{"018C",18},
	{"19CH",19},
	{"19CN",19},
	{"019C",19},
	{"20CH",20},
	{"20CN",20},
	{"020C",20},
	{"21CH",21},
	{"21CN",21},
	{"021C",21},
	{"22CH",22},
	{"22CN",22},
	{"022C",22},
	{"23CH",23},
	{"23CN",23},
	{"023C",23},
	{"24CH",24},
	{"24CN",24},
	{"024C",24},
	{"25CH",25},
	{"25CN",25},
	{"025C",25},
	{"26CH",26},
	{"26CN",26},
	{"026C",26},
	{"27CH",27},
	{"27CN",27},
	{"027C",27},
	{"28CH",28},
	{"28CN",28},
	{"028C",28},
	{"29CH",29},
	{"29CN",29},
	{"029C",29},
	{"30CH",30},
	{"30CN",30},
	{"030C",30},
	{"31CH",31},
	{"31CN",31},
	{"031C",31},
	{"32CH",32},
	{"32CN",32},
	{"032C",32},
	{"33CH",33},
	{"33CN",33},
	{"033C",33},
	{"34CH",34},
	{"34CN",34},
	{"034C",34},
	{"35CH",35},
	{"35CN",35},
	{"035C",35},
	{"36CH",36},
	{"36CN",36},
	{"036C",36},
	{"37CH",37},
	{"37CN",37},
	{"037C",37},
	{"38CH",38},
	{"38CN",38},
	{"038C",38},
	{"39CH",39},
	{"39CN",39},
	{"039C",39},
	{"40CH",40},
	{"40CN",40},
	{"040C",40},
	{"41CH",41},
	{"41CN",41},
	{"041C",41},
	{"42CH",42},
	{"42CN",42},
	{"042C",42},
	{"43CH",43},
	{"43CN",43},
	{"043C",43},
	{"44CH",44},
	{"44CN",44},
	{"044C",44},
	{"45CH",45},
	{"45CN",45},
	{"045C",45},
	{"46CH",46},
	{"46CN",46},
	{"046C",46},
	{"47CH",47},
	{"47CN",47},
	{"047C",47},
	{"48CH",48},
	{"48CN",48},
	{"048C",48},
	{"49CH",49},
	{"49CN",49},
	{"049C",49},
	{"50CH",50},
	{"50CN",50},
	{"050C",50},
	{"51CH",51},
	{"51CN",51},
	{"051C",51},
	{"52CH",52},
	{"52CN",52},
	{"052C",52},
	{"53CH",53},
	{"53CN",53},
	{"053C",53},
	{"54CH",54},
	{"54CN",54},
	{"054C",54},
	{"55CH",55},
	{"55CN",55},
	{"055C",55},
	{"56CH",56},
	{"56CN",56},
	{"056C",56},
	{"57CH",57},
	{"57CN",57},
	{"057C",57},
	{"58CH",58},
	{"58CN",58},
	{"058C",58},
	{"59CH",59},
	{"59CN",59},
	{"059C",59},
	{"60CH",60},
	{"60CN",60},
	{"060C",60},
	{"61CH",61},
	{"61CN",61},
	{"061C",61},
	{"62CH",62},
	{"62CN",62},
	{"062C",62},
	{"63CH",63},
	{"63CN",63},
	{"063C",63},
	{"64CH",64},
	{"64CN",64},
	{"064C",64},
	{"65CH",65},
	{"65CN",65},
	{"065C",65},
	{"66CH",66},
	{"66CN",66},
	{"066C",66},
	{"67CH",67},
	{"67CN",67},
	{"067C",67},
	{"68CH",68},
	{"68CN",68},
	{"068C",68},
	{"69CH",69},
	{"69CN",69},
	{"069C",69},
	{"70CH",70},
	{"70CN",70},
	{"070C",70},
	{"71CH",71},
	{"71CN",71},
	{"071C",71},
	{"72CH",72},
	{"72CN",72},
	{"072C",72},
	{"73CH",73},
	{"73CN",73},
	{"073C",73},
	{"74CH",74},
	{"74CN",74},
	{"074C",74},
	{"75CH",75},
	{"75CN",75},
	{"075C",75},
	{"76CH",76},
	{"76CN",76},
	{"076C",76},
	{"77CH",77},
	{"77CN",77},
	{"077C",77},
	{"78CH",78},
	{"78CN",78},
	{"078C",78},
	{"79CH",79},
	{"79CN",79},
	{"079C",79},
	{"80CH",80},
	{"80CN",80},
	{"080C",80},
	{"81CH",81},
	{"81CN",81},
	{"081C",81},
	{"82CH",82},
	{"82CN",82},
	{"082C",82},
	{"83CH",83},
	{"83CN",83},
	{"083C",83},
	{"84CH",84},
	{"84CN",84},
	{"084C",84},
	{"85CH",85},
	{"85CN",85},
	{"085C",85},
	{"86CH",86},
	{"86CN",86},
	{"086C",86},
	{"87CH",87},
	{"87CN",87},
	{"087C",87},
	{"88CH",88},
	{"88CN",88},
	{"088C",88},
	{"89CH",89},
	{"89CN",89},
	{"089C",89},
	{"90CH",90},
	{"90CN",90},
	{"090C",90},
	{"91CH",91},
	{"91CN",91},
	{"091C",91},
	{"92CH",92},
	{"92CN",92},
	{"092C",92},
	{"93CH",93},
	{"93CN",93},
	{"093C",93},
	{"94CH",94},
	{"94CN",94},
	{"094C",94},
	{"95CH",95},
	{"95CN",95},
	{"095C",95},
	{"96CH",96},
	{"96CN",96},
	{"096C",96},
	{"97CH",97},
	{"97CN",97},
	{"097C",97},
	{"98CH",98},
	{"98CN",98},
	{"098C",98},
	{"99CH",99},
	{"99CN",99},
	{"099C",99},
	{"100C",100},
	{"101C",101},
	{"102C",102},
	{"103C",103},
	{"104C",104},
	{"105C",105},
	{"106C",106},
	{"107C",107},
	{"108C",108},
	{"109C",109},
	{"110C",110},
	{"111C",111},
	{"112C",112},
	{"113C",113},
	{"114C",114},
	{"115C",115},
	{"116C",116},
	{"117C",117},
	{"118C",118},
	{"119C",119},
	{"120C",120},
	{"121C",121},
	{"122C",122},
	{"123C",123},
	{"124C",124},
	{"125C",125},
	{"126C",126},
	{"127C",127},
	{"128C",128},
	{"129C",129},
	{"130C",130},
	{"131C",131},
	{"132C",132},
	{"133C",133},
	{"134C",134},
	{"135C",135},
	{"136C",136},
	{"137C",137},
	{"138C",138},
	{"139C",139},
	{"140C",140},
	{"141C",141},
	{"142C",142},
	{"143C",143},
	{"144C",144},
	{"145C",145},
	{"146C",146},
	{"147C",147},
	{"148C",148},
	{"149C",149},
	{"150C",150},
	{"151C",151},
	{"152C",152},
	{"153C",153},
	{"154C",154},
	{"155C",155},
	{"156C",156},
	{"157C",157},
	{"158C",158},
	{"159C",159},
	{"160C",160},
	{"161C",161},
	{"162C",162},
	{"163C",163},
	{"164C",164},
	{"165C",165},
	{"166C",166},
	{"167C",167},
	{"168C",168},
	{"169C",169},
	{"170C",170},
	{"171C",171},
	{"172C",172},
	{"173C",173},
	{"174C",174},
	{"175C",175},
	{"176C",176},
	{"177C",177},
	{"178C",178},
	{"179C",179},
	{"180C",180},
	{"181C",181},
	{"182C",182},
	{"183C",183},
	{"184C",184},
	{"185C",185},
	{"186C",186},
	{"187C",187},
	{"188C",188},
	{"189C",189},
	{"190C",190},
	{"191C",191},
	{"192C",192},
	{"193C",193},
	{"194C",194},
	{"195C",195},
	{"196C",196},
	{"197C",197},
	{"198C",198},
	{"199C",199},
	{"200C",200},
	{"201C",201},
	{"202C",202},
	{"203C",203},
	{"204C",204},
	{"205C",205},
	{"206C",206},
	{"207C",207},
	{"208C",208},
	{"209C",209},
	{"210C",210},
	{"211C",211},
	{"212C",212},
	{"213C",213},
	{"214C",214},
	{"215C",215},
	{"216C",216},
	{"217C",217},
	{"218C",218},
	{"219C",219},
	{"220C",220},
	{"221C",221},
	{"222C",222},
	{"223C",223},
	{"224C",224},
	{"225C",225},
	{"226C",226},
	{"227C",227},
	{"228C",228},
	{"229C",229},
	{"230C",230},
	{"231C",231},
	{"232C",232},
	{"233C",233},
	{"234C",234},
	{"235C",235},
	{"236C",236},
	{"237C",237},
	{"238C",238},
	{"239C",239},
	{"240C",240},
	{"241C",241},
	{"242C",242},
	{"243C",243},
	{"244C",244},
	{"245C",245},
	{"246C",246},
	{"247C",247},
	{"248C",248},
	{"249C",249},
	{"250C",250},
	{"251C",251},
	{"252C",252},
	{"253C",253},
	{"254C",254},
	{"255C",255},
	{"256C",256},
	{"257C",257},
	{"258C",258},
	{"259C",259},
	{"260C",260},
	{"261C",261},
	{"262C",262},
	{"263C",263},
	{"264C",264},
	{"265C",265},
	{"266C",266},
	{"267C",267},
	{"268C",268},
	{"269C",269},
	{"270C",270},
	{"271C",271},
	{"272C",272},
	{"273C",273},
	{"274C",274},
	{"275C",275},
	{"276C",276},
	{"277C",277},
	{"278C",278},
	{"279C",279},
	{"280C",280},
	{"281C",281},
	{"282C",282},
	{"283C",283},
	{"284C",284},
	{"285C",285},
	{"286C",286},
	{"287C",287},
	{"288C",288},
	{"289C",289},
	{"290C",290},
	{"291C",291},
	{"292C",292},
	{"293C",293},
	{"294C",294},
	{"295C",295},
	{"296C",296},
	{"297C",297},
	{"298C",298},
	{"299C",299},
	{"300C",300},
	{"301C",301},
	{"302C",302},
	{"303C",303},
	{"304C",304},
	{"305C",305},
	{"306C",306},
	{"307C",307},
	{"308C",308},
	{"309C",309},
	{"310C",310},
	{"311C",311},
	{"312C",312},
	{"313C",313},
	{"314C",314},
	{"315C",315},
	{"316C",316},
	{"317C",317},
	{"318C",318},
	{"319C",319},
	{"320C",320},
	{"321C",321},
	{"322C",322},
	{"323C",323},
	{"324C",324},
	{"325C",325},
	{"326C",326},
	{"327C",327},
	{"328C",328},
	{"329C",329},
	{"330C",330},
	{"331C",331},
	{"332C",332},
	{"333C",333},
	{"334C",334},
	{"335C",335},
	{"336C",336},
	{"337C",337},
	{"338C",338},
	{"339C",339},
	{"340C",340},
	{"341C",341},
	{"342C",342},
	{"343C",343},
	{"344C",344},
	{"345C",345},
	{"346C",346},
	{"347C",347},
	{"348C",348},
	{"349C",349},
	{"350C",350},
	{"351C",351},
	{"352C",352},
	{"353C",353},
	{"354C",354},
	{"355C",355},
	{"356C",356},
	{"357C",357},
	{"358C",358},
	{"359C",359},
	{"360C",360},
	{"361C",361},
	{"362C",362},
	{"363C",363},
	{"364C",364},
	{"365C",365},
	{"366C",366},
	{"367C",367},
	{"368C",368},
	{"369C",369},
	{"370C",370},
	{"371C",371},
	{"372C",372},
	{"373C",373},
	{"374C",374},
	{"375C",375},
	{"376C",376},
	{"377C",377},
	{"378C",378},
	{"379C",379},
	{"380C",380},
	{"381C",381},
	{"382C",382},
	{"383C",383},
	{"384C",384},
	{"385C",385},
	{"386C",386},
	{"387C",387},
	{"388C",388},
	{"389C",389},
	{"390C",390},
	{"391C",391},
	{"392C",392},
	{"393C",393},
	{"394C",394},
	{"395C",395},
	{"396C",396},
	{"397C",397},
	{"398C",398},
	{"399C",399},
	{"400C",400},
	{"401C",401},
	{"402C",402},
	{"403C",403},
	{"404C",404},
	{"405C",405},
	{"406C",406},
	{"407C",407},
	{"408C",408},
	{"409C",409},
	{"410C",410},
	{"411C",411},
	{"412C",412},
	{"413C",413},
	{"414C",414},
	{"415C",415},
	{"416C",416},
	{"417C",417},
	{"418C",418},
	{"419C",419},
	{"420C",420},
	{"421C",421},
	{"422C",422},
	{"423C",423},
	{"424C",424},
	{"425C",425},
	{"426C",426},
	{"427C",427},
	{"428C",428},
	{"429C",429},
	{"430C",430},
	{"431C",431},
	{"432C",432},
	{"433C",433},
	{"434C",434},
	{"435C",435},
	{"436C",436},
	{"437C",437},
	{"438C",438},
	{"439C",439},
	{"440C",440},
	{"441C",441},
	{"442C",442},
	{"443C",443},
	{"444C",444},
	{"445C",445},
	{"446C",446},
	{"447C",447},
	{"448C",448},
	{"449C",449},
	{"450C",450},
	{"451C",451},
	{"452C",452},
	{"453C",453},
	{"454C",454},
	{"455C",455},
	{"456C",456},
	{"457C",457},
	{"458C",458},
	{"459C",459},
	{"460C",460},
	{"461C",461},
	{"462C",462},
	{"463C",463},
	{"464C",464},
	{"465C",465},
	{"466C",466},
	{"467C",467},
	{"468C",468},
	{"469C",469},
	{"470C",470},
	{"471C",471},
	{"472C",472},
	{"473C",473},
	{"474C",474},
	{"475C",475},
	{"476C",476},
	{"477C",477},
	{"478C",478},
	{"479C",479},
	{"480C",480},
	{"481C",481},
	{"482C",482},
	{"483C",483},
	{"484C",484},
	{"485C",485},
	{"486C",486},
	{"487C",487},
	{"488C",488},
	{"489C",489},
	{"490C",490},
	{"491C",491},
	{"492C",492},
	{"493C",493},
	{"494C",494},
	{"495C",495},
	{"496C",496},
	{"497C",497},
	{"498C",498},
	{"499C",499},
	{"500C",500},
	{"501C",501},
	{"502C",502},
	{"503C",503},
	{"504C",504},
	{"505C",505},
	{"506C",506},
	{"507C",507},
	{"508C",508},
	{"509C",509},
	{"510C",510},
	{"511C",511},
	{"512C",512},
	{"513C",513},
	{"514C",514},
	{"515C",515},
	{"516C",516},
	{"517C",517},
	{"518C",518},
	{"519C",519},
	{"520C",520},
	{"521C",521},
	{"522C",522},
	{"523C",523},
	{"524C",524},
	{"525C",525},
	{"526C",526},
	{"527C",527},
	{"528C",528},
	{"529C",529},
	{"530C",530},
	{"531C",531},
	{"532C",532},
	{"533C",533},
	{"534C",534},
	{"535C",535},
	{"536C",536},
	{"537C",537},
	{"538C",538},
	{"539C",539},
	{"540C",540},
	{"541C",541},
	{"542C",542},
	{"543C",543},
	{"544C",544},
	{"545C",545},
	{"546C",546},
	{"547C",547},
	{"548C",548},
	{"549C",549},
	{"550C",550},
	{"551C",551},
	{"552C",552},
	{"553C",553},
	{"554C",554},
	{"555C",555},
	{"556C",556},
	{"557C",557},
	{"558C",558},
	{"559C",559},
	{"560C",560},
	{"561C",561},
	{"562C",562},
	{"563C",563},
	{"564C",564},
	{"565C",565},
	{"566C",566},
	{"567C",567},
	{"568C",568},
	{"569C",569},
	{"570C",570},
	{"571C",571},
	{"572C",572},
	{"573C",573},
	{"574C",574},
	{"575C",575},
	{"576C",576},
	{"577C",577},
	{"578C",578},
	{"579C",579},
	{"580C",580},
	{"581C",581},
	{"582C",582},
	{"583C",583},
	{"584C",584},
	{"585C",585},
	{"586C",586},
	{"587C",587},
	{"588C",588},
	{"589C",589},
	{"590C",590},
	{"591C",591},
	{"592C",592},
	{"593C",593},
	{"594C",594},
	{"595C",595},
	{"596C",596},
	{"597C",597},
	{"598C",598},
	{"599C",599},
	{"600C",600},
	{"601C",601},
	{"602C",602},
	{"603C",603},
	{"604C",604},
	{"605C",605},
	{"606C",606},
	{"607C",607},
	{"608C",608},
	{"609C",609},
	{"610C",610},
	{"611C",611},
	{"612C",612},
	{"613C",613},
	{"614C",614},
	{"615C",615},
	{"616C",616},
	{"617C",617},
	{"618C",618},
	{"619C",619},
	{"620C",620},
	{"621C",621},
	{"622C",622},
	{"623C",623},
	{"624C",624},
	{"625C",625},
	{"626C",626},
	{"627C",627},
	{"628C",628},
	{"629C",629},
	{"630C",630},
	{"631C",631},
	{"632C",632},
	{"633C",633},
	{"634C",634},
	{"635C",635},
	{"636C",636},
	{"637C",637},
	{"638C",638},
	{"639C",639},
	{"640C",640},
	{"641C",641},
	{"642C",642},
	{"643C",643},
	{"644C",644},
	{"645C",645},
	{"646C",646},
	{"647C",647},
	{"648C",648},
	{"649C",649},
	{"650C",650},
	{"651C",651},
	{"652C",652},
	{"653C",653},
	{"654C",654},
	{"655C",655},
	{"656C",656},
	{"657C",657},
	{"658C",658},
	{"659C",659},
	{"660C",660},
	{"661C",661},
	{"662C",662},
	{"663C",663},
	{"664C",664},
	{"665C",665},
	{"666C",666},
	{"667C",667},
	{"668C",668},
	{"669C",669},
	{"670C",670},
	{"671C",671},
	{"672C",672},
	{"673C",673},
	{"674C",674},
	{"675C",675},
	{"676C",676},
	{"677C",677},
	{"678C",678},
	{"679C",679},
	{"680C",680},
	{"681C",681},
	{"682C",682},
	{"683C",683},
	{"684C",684},
	{"685C",685},
	{"686C",686},
	{"687C",687},
	{"688C",688},
	{"689C",689},
	{"690C",690},
	{"691C",691},
	{"692C",692},
	{"693C",693},
	{"694C",694},
	{"695C",695},
	{"696C",696},
	{"697C",697},
	{"698C",698},
	{"699C",699},
	{"700C",700},
	{"701C",701},
	{"702C",702},
	{"703C",703},
	{"704C",704},
	{"705C",705},
	{"706C",706},
	{"707C",707},
	{"708C",708},
	{"709C",709},
	{"710C",710},
	{"711C",711},
	{"712C",712},
	{"713C",713},
	{"714C",714},
	{"715C",715},
	{"716C",716},
	{"717C",717},
	{"718C",718},
	{"719C",719},
	{"720C",720},
	{"721C",721},
	{"722C",722},
	{"723C",723},
	{"724C",724},
	{"725C",725},
	{"726C",726},
	{"727C",727},
	{"728C",728},
	{"729C",729},
	{"730C",730},
	{"731C",731},
	{"732C",732},
	{"733C",733},
	{"734C",734},
	{"735C",735},
	{"736C",736},
	{"737C",737},
	{"738C",738},
	{"739C",739},
	{"740C",740},
	{"741C",741},
	{"742C",742},
	{"743C",743},
	{"744C",744},
	{"745C",745},
	{"746C",746},
	{"747C",747},
	{"748C",748},
	{"749C",749},
	{"750C",750},
	{"751C",751},
	{"752C",752},
	{"753C",753},
	{"754C",754},
	{"755C",755},
	{"756C",756},
	{"757C",757},
	{"758C",758},
	{"759C",759},
	{"760C",760},
	{"761C",761},
	{"762C",762},
	{"763C",763},
	{"764C",764},
	{"765C",765},
	{"766C",766},
	{"767C",767},
	{"768C",768},
	{"769C",769},
	{"770C",770},
	{"771C",771},
	{"772C",772},
	{"773C",773},
	{"774C",774},
	{"775C",775},
	{"776C",776},
	{"777C",777},
	{"778C",778},
	{"779C",779},
	{"780C",780},
	{"781C",781},
	{"782C",782},
	{"783C",783},
	{"784C",784},
	{"785C",785},
	{"786C",786},
	{"787C",787},
	{"788C",788},
	{"789C",789},
	{"790C",790},
	{"791C",791},
	{"792C",792},
	{"793C",793},
	{"794C",794},
	{"795C",795},
	{"796C",796},
	{"797C",797},
	{"798C",798},
	{"799C",799},
	{"800C",800},
	{"801C",801},
	{"802C",802},
	{"803C",803},
	{"804C",804},
	{"805C",805},
	{"806C",806},
	{"807C",807},
	{"808C",808},
	{"809C",809},
	{"810C",810},
	{"811C",811},
	{"812C",812},
	{"813C",813},
	{"814C",814},
	{"815C",815},
	{"816C",816},
	{"817C",817},
	{"818C",818},
	{"819C",819},
	{"820C",820},
	{"821C",821},
	{"822C",822},
	{"823C",823},
	{"824C",824},
	{"825C",825},
	{"826C",826},
	{"827C",827},
	{"828C",828},
	{"829C",829},
	{"830C",830},
	{"831C",831},
	{"832C",832},
	{"833C",833},
	{"834C",834},
	{"835C",835},
	{"836C",836},
	{"837C",837},
	{"838C",838},
	{"839C",839},
	{"840C",840},
	{"841C",841},
	{"842C",842},
	{"843C",843},
	{"844C",844},
	{"845C",845},
	{"846C",846},
	{"847C",847},
	{"848C",848},
	{"849C",849},
	{"850C",850},
	{"851C",851},
	{"852C",852},
	{"853C",853},
	{"854C",854},
	{"855C",855},
	{"856C",856},
	{"857C",857},
	{"858C",858},
	{"859C",859},
	{"860C",860},
	{"861C",861},
	{"862C",862},
	{"863C",863},
	{"864C",864},
	{"865C",865},
	{"866C",866},
	{"867C",867},
	{"868C",868},
	{"869C",869},
	{"870C",870},
	{"871C",871},
	{"872C",872},
	{"873C",873},
	{"874C",874},
	{"875C",875},
	{"876C",876},
	{"877C",877},
	{"878C",878},
	{"879C",879},
	{"880C",880},
	{"881C",881},
	{"882C",882},
	{"883C",883},
	{"884C",884},
	{"885C",885},
	{"886C",886},
	{"887C",887},
	{"888C",888},
	{"889C",889},
	{"890C",890},
	{"891C",891},
	{"892C",892},
	{"893C",893},
	{"894C",894},
	{"895C",895},
	{"896C",896},
	{"897C",897},
	{"898C",898},
	{"899C",899},
	{"900C",900},
	{"901C",901},
	{"902C",902},
	{"903C",903},
	{"904C",904},
	{"905C",905},
	{"906C",906},
	{"907C",907},
	{"908C",908},
	{"909C",909},
	{"910C",910},
	{"911C",911},
	{"912C",912},
	{"913C",913},
	{"914C",914},
	{"915C",915},
	{"916C",916},
	{"917C",917},
	{"918C",918},
	{"919C",919},
	{"920C",920},
	{"921C",921},
	{"922C",922},
	{"923C",923},
	{"924C",924},
	{"925C",925},
	{"926C",926},
	{"927C",927},
	{"928C",928},
	{"929C",929},
	{"930C",930},
	{"931C",931},
	{"932C",932},
	{"933C",933},
	{"934C",934},
	{"935C",935},
	{"936C",936},
	{"937C",937},
	{"938C",938},
	{"939C",939},
	{"940C",940},
	{"941C",941},
	{"942C",942},
	{"943C",943},
	{"944C",944},
	{"945C",945},
	{"946C",946},
	{"947C",947},
	{"948C",948},
	{"949C",949},
	{"950C",950},
	{"951C",951},
	{"952C",952},
	{"953C",953},
	{"954C",954},
	{"955C",955},
	{"956C",956},
	{"957C",957},
	{"958C",958},
	{"959C",959},
	{"960C",960},
	{"961C",961},
	{"962C",962},
	{"963C",963},
	{"964C",964},
	{"965C",965},
	{"966C",966},
	{"967C",967},
	{"968C",968},
	{"969C",969},
	{"970C",970},
	{"971C",971},
	{"972C",972},
	{"973C",973},
	{"974C",974},
	{"975C",975},
	{"976C",976},
	{"977C",977},
	{"978C",978},
	{"979C",979},
	{"980C",980},
	{"981C",981},
	{"982C",982},
	{"983C",983},
	{"984C",984},
	{"985C",985},
	{"986C",986},
	{"987C",987},
	{"988C",988},
	{"989C",989},
	{"990C",990},
	{"991C",991},
	{"992C",992},
	{"993C",993},
	{"994C",994},
	{"995C",995},
	{"996C",996},
	{"997C",997},
	{"998C",998},
	{"999C",999},
	{"",0}
};

///////////////////////////////////////////////////////////////////////////////////

static void memcopy( void * dest, void *source, unsigned long size )
{
	unsigned long i;
	unsigned char * d,*s;

	d=(unsigned char*)dest;
	s=(unsigned char*)source;
	for(i=0;i<size;i++)
	{
		d[i]=s[i];
	}
}

static void memclear( void * dest, unsigned char value, unsigned long size )
{
	unsigned long i;
	unsigned char * d;

	d=(unsigned char*)dest;
	for(i=0;i<size;i++)
	{
		d[i]=value;
	}
}

static int memcompare( unsigned char * buf1, unsigned char * buf2, unsigned int size )
{
	unsigned int i;

	i = 0;

	while(i<size)
	{
		if(buf1[i] != buf2[i])
		{
			return 0;
		}
		i++;
	}

	return 1;
}

static int getnote( modcontext * mod, unsigned short period, int finetune )
{
	int i;

	for(i = 0; i < FULL_PERIOD_TABLE_LENGTH; i++)
	{
		if(period >= mod->fullperiod[i])
		{
			return i;
		}
	}

	return MAXNOTES;
}

static void doFunk(channel * cptr)
{
	if(cptr->funkspeed)
	{
		cptr->funkoffset += InvertLoopTable[cptr->funkspeed];
		if( cptr->funkoffset > 128 )
		{
			cptr->funkoffset = 0;
			if( cptr->sampdata && cptr->length && (cptr->replen > 2) )
			{
				if( ( (cptr->samppos) >> 10 ) >= (unsigned long)(cptr->replen+cptr->reppnt) )
				{
					cptr->samppos = ((unsigned long)(cptr->reppnt)<<10) + (cptr->samppos % ((unsigned long)(cptr->replen+cptr->reppnt)<<10));
				}

				// Note : Directly modify the sample in the mod buffer...
				// The current Invert Loop effect implementation can't be played from ROM.
				cptr->sampdata[cptr->samppos >> 10] = -1 - cptr->sampdata[cptr->samppos >> 10];
			}
		}
	}
}

static void worknote( note * nptr, channel * cptr,char t,modcontext * mod )
{
	muint sample, period, effect, operiod;
	muint curnote, arpnote;
	muchar effect_op;
	muchar effect_param,effect_param_l,effect_param_h;
	muint enable_nxt_smp;
	sample = (nptr->sampperiod & 0xF0) | (nptr->sampeffect >> 4);
	period = ((nptr->sampperiod & 0xF) << 8) | nptr->period;
	effect = ((nptr->sampeffect & 0xF) << 8) | nptr->effect;
	effect_op = nptr->sampeffect & 0xF;
	effect_param = nptr->effect;
	effect_param_l = effect_param & 0x0F;
	effect_param_h = effect_param >> 4;

	enable_nxt_smp = 0;

	operiod = cptr->period;

	if ( period || sample )
	{
		if( sample && ( sample < 32 ) )
		{
			cptr->sampnum = sample - 1;
		}

		if( period || sample )
		{
			if( period )
			{
				if( ( effect_op != EFFECT_TONE_PORTAMENTO ) || ( ( effect_op == EFFECT_TONE_PORTAMENTO ) && !cptr->sampdata ) )
				{
					// Not a Tone Partamento effect or no sound currently played :
					if ( ( effect_op != EFFECT_EXTENDED || effect_param_h != EFFECT_E_NOTE_DELAY ) || ( ( effect_op == EFFECT_EXTENDED && effect_param_h == EFFECT_E_NOTE_DELAY ) && !effect_param_l ) )
					{
						// Immediately (re)trigger the new note
						cptr->sampdata = mod->sampledata[cptr->sampnum];
						cptr->length = mod->song.samples[cptr->sampnum].length;
						cptr->reppnt = mod->song.samples[cptr->sampnum].reppnt;
						cptr->replen = mod->song.samples[cptr->sampnum].replen;

						cptr->lst_sampdata = cptr->sampdata;
						cptr->lst_length = cptr->length;
						cptr->lst_reppnt = cptr->reppnt;
						cptr->lst_replen = cptr->replen;
					}
					else
					{
						cptr->dly_sampdata = mod->sampledata[cptr->sampnum];
						cptr->dly_length = mod->song.samples[cptr->sampnum].length;
						cptr->dly_reppnt = mod->song.samples[cptr->sampnum].reppnt;
						cptr->dly_replen = mod->song.samples[cptr->sampnum].replen;
						cptr->note_delay = effect_param_l;
					}
					// Cancel any delayed note...
					cptr->update_nxt_repeat = 0;
				}
				else
				{
					// Partamento effect - Play the new note after the current sample.
					if( effect_op == EFFECT_TONE_PORTAMENTO )
						enable_nxt_smp = 1;
				}
			}
			else // Note without period : Trigger it after the current sample.
				enable_nxt_smp = 1;

			if ( enable_nxt_smp )
			{
				// Prepare the next sample retrigger after the current one
				cptr->nxt_sampdata = mod->sampledata[cptr->sampnum];
				cptr->nxt_length = mod->song.samples[cptr->sampnum].length;
				cptr->nxt_reppnt = mod->song.samples[cptr->sampnum].reppnt;
				cptr->nxt_replen = mod->song.samples[cptr->sampnum].replen;

				if(cptr->nxt_replen<=2)   // Protracker : don't play the sample if not looped...
					cptr->nxt_sampdata = 0;

				cptr->update_nxt_repeat = 1;
			}

			cptr->finetune = (mod->song.samples[cptr->sampnum].finetune) & 0xF;

			if( effect_op != EFFECT_VIBRATO && effect_op != EFFECT_VOLSLIDE_VIBRATO )
			{
				cptr->vibraperiod = 0;
				cptr->vibrapointeur = 0;
			}
		}

		if( (sample != 0) && ( effect_op != EFFECT_VOLSLIDE_TONEPORTA ) )
		{
			cptr->volume = mod->song.samples[cptr->sampnum].volume;
			cptr->volumeslide = 0;
		}

		if( ( effect_op != EFFECT_TONE_PORTAMENTO ) && ( effect_op != EFFECT_VOLSLIDE_TONEPORTA ) )
		{
			if ( period != 0 )
				cptr->samppos = 0;
		}

		cptr->decalperiod = 0;
		if( period )
		{
			if( cptr->finetune )
			{
				if( cptr->finetune <= 7 )
				{
					period = mod->fullperiod[getnote(mod,period,0) + cptr->finetune];
				}
				else
				{
					period = mod->fullperiod[getnote(mod,period,0) - (16 - (cptr->finetune)) ];
				}
			}

			cptr->period = period;
		}
	}

	cptr->effect = 0;
	cptr->parameffect = 0;
	cptr->effect_code = effect;

#ifdef EFFECTS_USAGE_STATE
	if(effect_op || ((effect_op==EFFECT_ARPEGGIO) && effect_param))
	{
		mod->effects_event_counts[ effect_op ]++;
	}

	if(effect_op == 0xE)
		mod->effects_event_counts[ 0x10 + effect_param_h ]++;
#endif

	switch ( effect_op )
	{
		case EFFECT_ARPEGGIO:
			/*
			[0]: Arpeggio
			Where [0][x][y] means "play note, note+x semitones, note+y
			semitones, then return to original note". The fluctuations are
			carried out evenly spaced in one pattern division. They are usually
			used to simulate chords, but this doesn't work too well. They are
			also used to produce heavy vibrato. A major chord is when x=4, y=7.
			A minor chord is when x=3, y=7.
			*/

			if( effect_param )
			{
				cptr->effect = EFFECT_ARPEGGIO;
				cptr->parameffect = effect_param;

				cptr->ArpIndex = 0;

				curnote = getnote(mod,cptr->period,cptr->finetune);

				cptr->Arpperiods[0] = cptr->period;

				arpnote = curnote + (((cptr->parameffect>>4)&0xF)*8);
				if( arpnote >= FULL_PERIOD_TABLE_LENGTH )
					arpnote = FULL_PERIOD_TABLE_LENGTH - 1;

				cptr->Arpperiods[1] = mod->fullperiod[arpnote];

				arpnote = curnote + (((cptr->parameffect)&0xF)*8);
				if( arpnote >= FULL_PERIOD_TABLE_LENGTH )
					arpnote = FULL_PERIOD_TABLE_LENGTH - 1;

				cptr->Arpperiods[2] = mod->fullperiod[arpnote];
			}
		break;

		case EFFECT_PORTAMENTO_UP:
			/*
			[1]: Slide up
			Where [1][x][y] means "smoothly decrease the period of current
			sample by x*16+y after each tick in the division". The
			ticks/division are set with the 'set speed' effect (see below). If
			the period of the note being played is z, then the final period
			will be z - (x*16 + y)*(ticks - 1). As the slide rate depends on
			the speed, changing the speed will change the slide. You cannot
			slide beyond the note B3 (period 113).
			*/

			cptr->effect = EFFECT_PORTAMENTO_UP;
			cptr->parameffect = effect_param;
		break;

		case EFFECT_PORTAMENTO_DOWN:
			/*
			[2]: Slide down
			Where [2][x][y] means "smoothly increase the period of current
			sample by x*16+y after each tick in the division". Similar to [1],
			but lowers the pitch. You cannot slide beyond the note C1 (period
			856).
			*/

			cptr->effect = EFFECT_PORTAMENTO_DOWN;
			cptr->parameffect = effect_param;
		break;

		case EFFECT_TONE_PORTAMENTO:
			/*
			[3]: Slide to note
			Where [3][x][y] means "smoothly change the period of current sample
			by x*16+y after each tick in the division, never sliding beyond
			current period". The period-length in this channel's division is a
			parameter to this effect, and hence is not played. Sliding to a
			note is similar to effects [1] and [2], but the slide will not go
			beyond the given period, and the direction is implied by that
			period. If x and y are both 0, then the old slide will continue.
			*/

			cptr->effect = EFFECT_TONE_PORTAMENTO;
			if( effect_param != 0 )
			{
				cptr->portaspeed = (short)( effect_param );
			}

			if(period!=0)
			{
				cptr->portaperiod = period;
				cptr->period = operiod;
			}
		break;

		case EFFECT_VIBRATO:
			/*
			[4]: Vibrato
			Where [4][x][y] means "oscillate the sample pitch using a
			particular waveform with amplitude y/16 semitones, such that (x *
			ticks)/64 cycles occur in the division". The waveform is set using
			effect [14][4]. By placing vibrato effects on consecutive
			divisions, the vibrato effect can be maintained. If either x or y
			are 0, then the old vibrato values will be used.
			*/

			cptr->effect = EFFECT_VIBRATO;
			if( effect_param_l != 0 ) // Depth continue or change ?
				cptr->vibraparam = ( cptr->vibraparam & 0xF0 ) | effect_param_l;
			if( effect_param_h != 0 ) // Speed continue or change ?
				cptr->vibraparam = ( cptr->vibraparam & 0x0F ) | ( effect_param_h << 4 );

		break;

		case EFFECT_VOLSLIDE_TONEPORTA:
			/*
			[5]: Continue 'Slide to note', but also do Volume slide
			Where [5][x][y] means "either slide the volume up x*(ticks - 1) or
			slide the volume down y*(ticks - 1), at the same time as continuing
			the last 'Slide to note'". It is illegal for both x and y to be
			non-zero. You cannot slide outside the volume range 0..64. The
			period-length in this channel's division is a parameter to this
			effect, and hence is not played.
			*/

			if( period != 0 )
			{
				cptr->portaperiod = period;
				cptr->period = operiod;
			}

			cptr->effect = EFFECT_VOLSLIDE_TONEPORTA;
			if( effect_param != 0 )
				cptr->volumeslide = effect_param;

		break;

		case EFFECT_VOLSLIDE_VIBRATO:
			/*
			[6]: Continue 'Vibrato', but also do Volume slide
			Where [6][x][y] means "either slide the volume up x*(ticks - 1) or
			slide the volume down y*(ticks - 1), at the same time as continuing
			the last 'Vibrato'". It is illegal for both x and y to be non-zero.
			You cannot slide outside the volume range 0..64.
			*/

			cptr->effect = EFFECT_VOLSLIDE_VIBRATO;
			if( effect_param != 0 )
				cptr->volumeslide = effect_param;
		break;

		case EFFECT_SET_OFFSET:
			/*
			[9]: Set sample offset
			Where [9][x][y] means "play the sample from offset x*4096 + y*256".
			The offset is measured in words. If no sample is given, yet one is
			still playing on this channel, it should be retriggered to the new
			offset using the current volume.
			*/

			cptr->samppos = ( ( ((muint)effect_param_h) << 12) + ( (((muint)effect_param_l) << 8) ) ) << 10;
		break;

		case EFFECT_VOLUME_SLIDE:
			/*
			[10]: Volume slide
			Where [10][x][y] means "either slide the volume up x*(ticks - 1) or
			slide the volume down y*(ticks - 1)". If both x and y are non-zero,
			then the y value is ignored (assumed to be 0). You cannot slide
			outside the volume range 0..64.
			*/

			cptr->effect = EFFECT_VOLUME_SLIDE;
			cptr->volumeslide = effect_param;
		break;

		case EFFECT_JUMP_POSITION:
			/*
			[11]: Position Jump
			Where [11][x][y] means "stop the pattern after this division, and
			continue the song at song-position x*16+y". This shifts the
			'pattern-cursor' in the pattern table (see above). Legal values for
			x*16+y are from 0 to 127.
			*/

			mod->tablepos = effect_param;
			if(mod->tablepos >= mod->song.length)
				mod->tablepos = 0;
			mod->patternpos = 0;
			mod->jump_loop_effect = 1;

		break;

		case EFFECT_SET_VOLUME:
			/*
			[12]: Set volume
			Where [12][x][y] means "set current sample's volume to x*16+y".
			Legal volumes are 0..64.
			*/

			cptr->volume = effect_param;
		break;

		case EFFECT_PATTERN_BREAK:
			/*
			[13]: Pattern Break
			Where [13][x][y] means "stop the pattern after this division, and
			continue the song at the next pattern at division x*10+y" (the 10
			is not a typo). Legal divisions are from 0 to 63 (note Protracker
			exception above).
			*/

			mod->patternpos = ( (muint)(effect_param_h) * 10 + effect_param_l ) * mod->number_of_channels;
			mod->jump_loop_effect = 1;
			mod->tablepos++;
			if(mod->tablepos >= mod->song.length)
				mod->tablepos = 0;

		break;

		case EFFECT_EXTENDED:
			switch( effect_param_h )
			{
				case EFFECT_E_FINE_PORTA_UP:
					/*
					[14][1]: Fineslide up
					Where [14][1][x] means "decrement the period of the current sample
					by x". The incrementing takes place at the beginning of the
					division, and hence there is no actual sliding. You cannot slide
					beyond the note B3 (period 113).
					*/

					cptr->period -= effect_param_l;
					if( cptr->period < 113 )
						cptr->period = 113;
				break;

				case EFFECT_E_FINE_PORTA_DOWN:
					/*
					[14][2]: Fineslide down
					Where [14][2][x] means "increment the period of the current sample
					by x". Similar to [14][1] but shifts the pitch down. You cannot
					slide beyond the note C1 (period 856).
					*/

					cptr->period += effect_param_l;
					if( cptr->period > 856 )
						cptr->period = 856;
				break;

				case EFFECT_E_GLISSANDO_CTRL:
					/*
					[14][3]: Set glissando on/off
					Where [14][3][x] means "set glissando ON if x is 1, OFF if x is 0".
					Used in conjunction with [3] ('Slide to note'). If glissando is on,
					then 'Slide to note' will slide in semitones, otherwise will
					perform the default smooth slide.
					*/

					cptr->glissando = effect_param_l;
				break;

				case EFFECT_E_FINE_VOLSLIDE_UP:
					/*
					[14][10]: Fine volume slide up
					Where [14][10][x] means "increment the volume of the current sample
					by x". The incrementing takes place at the beginning of the
					division, and hence there is no sliding. You cannot slide beyond
					volume 64.
					*/

					cptr->volume += effect_param_l;
					if( cptr->volume > 64 )
						cptr->volume = 64;
				break;

				case EFFECT_E_FINE_VOLSLIDE_DOWN:
					/*
					[14][11]: Fine volume slide down
					Where [14][11][x] means "decrement the volume of the current sample
					by x". Similar to [14][10] but lowers volume. You cannot slide
					beyond volume 0.
					*/

					cptr->volume -= effect_param_l;
					if( cptr->volume > 200 )
						cptr->volume = 0;
				break;

				case EFFECT_E_SET_FINETUNE:
					/*
					[14][5]: Set finetune value
					Where [14][5][x] means "sets the finetune value of the current
					sample to the signed nibble x". x has legal values of 0..15,
					corresponding to signed nibbles 0..7,-8..-1 (see start of text for
					more info on finetune values).
					*/

					cptr->finetune = effect_param_l;

					if( period )
					{
						if( cptr->finetune )
						{
							if( cptr->finetune <= 7 )
							{
								period = mod->fullperiod[getnote(mod,period,0) + cptr->finetune];
							}
							else
							{
								period = mod->fullperiod[getnote(mod,period,0) - (16 - (cptr->finetune)) ];
							}
						}

						cptr->period = period;
					}

				break;

				case EFFECT_E_PATTERN_LOOP:
					/*
					[14][6]: Loop pattern
					Where [14][6][x] means "set the start of a loop to this division if
					x is 0, otherwise after this division, jump back to the start of a
					loop and play it another x times before continuing". If the start
					of the loop was not set, it will default to the start of the
					current pattern. Hence 'loop pattern' cannot be performed across
					multiple patterns. Note that loops do not support nesting, and you
					may generate an infinite loop if you try to nest 'loop pattern's.
					*/

					if( effect_param_l )
					{
						if( cptr->patternloopcnt )
						{
							cptr->patternloopcnt--;
							if( cptr->patternloopcnt )
							{
								mod->patternpos = cptr->patternloopstartpoint;
								mod->jump_loop_effect = 1;
							}
							else
							{
								cptr->patternloopstartpoint = mod->patternpos ;
							}
						}
						else
						{
							cptr->patternloopcnt = effect_param_l;
							mod->patternpos = cptr->patternloopstartpoint;
							mod->jump_loop_effect = 1;
						}
					}
					else // Start point
					{
						cptr->patternloopstartpoint = mod->patternpos;
					}

				break;

				case EFFECT_E_PATTERN_DELAY:
					/*
					[14][14]: Delay pattern
					Where [14][14][x] means "after this division there will be a delay
					equivalent to the time taken to play x divisions after which the
					pattern will be resumed". The delay only relates to the
					interpreting of new divisions, and all effects and previous notes
					continue during delay.
					*/

					mod->patterndelay = effect_param_l;
				break;

				case EFFECT_E_RETRIGGER_NOTE:
					/*
					[14][9]: Retrigger sample
					 Where [14][9][x] means "trigger current sample every x ticks in
					 this division". If x is 0, then no retriggering is done (acts as if
					 no effect was chosen), otherwise the retriggering begins on the
					 first tick and then x ticks after that, etc.
					*/

					if( effect_param_l )
					{
						cptr->effect = EFFECT_EXTENDED;
						cptr->parameffect = (EFFECT_E_RETRIGGER_NOTE<<4);
						cptr->retrig_param = effect_param_l;
						cptr->retrig_cnt = 0;
					}
				break;

				case EFFECT_E_NOTE_CUT:
					/*
					[14][12]: Cut sample
					Where [14][12][x] means "after the current sample has been played
					for x ticks in this division, its volume will be set to 0". This
					implies that if x is 0, then you will not hear any of the sample.
					If you wish to insert "silence" in a pattern, it is better to use a
					"silence"-sample (see above) due to the lack of proper support for
					this effect.
					*/

					cptr->effect = EFFECT_E_NOTE_CUT;
					cptr->cut_param = effect_param_l;
					if( !cptr->cut_param )
						cptr->volume = 0;
				break;

				case EFFECT_E_NOTE_DELAY:
					/*
					 Where [14][13][x] means "do not start this division's sample for
					 the first x ticks in this division, play the sample after this".
					 This implies that if x is 0, then you will hear no delay, but
					 actually there will be a VERY small delay. Note that this effect
					 only influences a sample if it was started in this division.
					*/

					cptr->effect = EFFECT_EXTENDED;
					cptr->parameffect = (EFFECT_E_NOTE_DELAY<<4);
				break;

				case EFFECT_E_INVERT_LOOP:
					/*
					Where [14][15][x] means "if x is greater than 0, then play the
					current sample's loop upside down at speed x". Each byte in the
					sample's loop will have its sign changed (negated). It will only
					work if the sample's loop (defined previously) is not too big. The
					speed is based on an internal table.
					*/

					cptr->funkspeed = effect_param_l;

					doFunk(cptr);

				break;

				default:

				break;
			}
		break;

		case 0xF:
			/*
			[15]: Set speed
			Where [15][x][y] means "set speed to x*16+y". Though it is nowhere
			near that simple. Let z = x*16+y. Depending on what values z takes,
			different units of speed are set, there being two: ticks/division
			and beats/minute (though this one is only a label and not strictly
			true). If z=0, then what should technically happen is that the
			module stops, but in practice it is treated as if z=1, because
			there is already a method for stopping the module (running out of
			patterns). If z<=32, then it means "set ticks/division to z"
			otherwise it means "set beats/minute to z" (convention says that
			this should read "If z<32.." but there are some composers out there
			that defy conventions). Default values are 6 ticks/division, and
			125 beats/minute (4 divisions = 1 beat). The beats/minute tag is
			only meaningful for 6 ticks/division. To get a more accurate view
			of how things work, use the following formula:
									 24 * beats/minute
				  divisions/minute = -----------------
									  ticks/division
			Hence divisions/minute range from 24.75 to 6120, eg. to get a value
			of 2000 divisions/minute use 3 ticks/division and 250 beats/minute.
			If multiple "set speed" effects are performed in a single division,
			the ones on higher-numbered channels take precedence over the ones
			on lower-numbered channels. This effect has a large number of
			different implementations, but the one described here has the
			widest usage.
			*/

			if( effect_param < 0x20 )
			{
				if( effect_param )
				{
					mod->song.speed = effect_param;
					mod->patternticksaim = (long)mod->song.speed * ((mod->playrate * 5 ) / (((long)2 * (long)mod->bpm)));
				}
			}

			if( effect_param >= 0x20 )
			{
				///	 HZ = 2 * BPM / 5
				mod->bpm = effect_param;
				mod->patternticksaim = (long)mod->song.speed * ((mod->playrate * 5 ) / (((long)2 * (long)mod->bpm)));
			}

		break;

		default:
		// Unsupported effect
		break;

	}

}

static void workeffect( modcontext * modctx, note * nptr, channel * cptr )
{
	doFunk(cptr);

	switch(cptr->effect)
	{
		case EFFECT_ARPEGGIO:

			if( cptr->parameffect )
			{
				cptr->decalperiod = cptr->period - cptr->Arpperiods[cptr->ArpIndex];

				cptr->ArpIndex++;
				if( cptr->ArpIndex>2 )
					cptr->ArpIndex = 0;
			}
		break;

		case EFFECT_PORTAMENTO_UP:

			if( cptr->period )
			{
				cptr->period -= cptr->parameffect;

				if( cptr->period < 113 || cptr->period > 20000 )
					cptr->period = 113;
			}

		break;

		case EFFECT_PORTAMENTO_DOWN:

			if( cptr->period )
			{
				cptr->period += cptr->parameffect;

				if( cptr->period > 20000 )
					cptr->period = 20000;
			}

		break;

		case EFFECT_VOLSLIDE_TONEPORTA:
		case EFFECT_TONE_PORTAMENTO:

			if( cptr->period && ( cptr->period != cptr->portaperiod ) && cptr->portaperiod )
			{
				if( cptr->period > cptr->portaperiod )
				{
					if( cptr->period - cptr->portaperiod >= cptr->portaspeed )
					{
						cptr->period -= cptr->portaspeed;
					}
					else
					{
						cptr->period = cptr->portaperiod;
					}
				}
				else
				{
					if( cptr->portaperiod - cptr->period >= cptr->portaspeed )
					{
						cptr->period += cptr->portaspeed;
					}
					else
					{
						cptr->period = cptr->portaperiod;
					}
				}

				if( cptr->period == cptr->portaperiod )
				{
					// If the slide is over, don't let it to be retriggered.
					cptr->portaperiod = 0;
				}
			}

			if( cptr->glissando )
			{
				// TODO : Glissando effect.
			}

			if( cptr->effect == EFFECT_VOLSLIDE_TONEPORTA )
			{
				if( cptr->volumeslide & 0xF0 )
				{
					cptr->volume += ( cptr->volumeslide >> 4 );

					if( cptr->volume > 63 )
						cptr->volume = 63;
				}
				else
				{
					cptr->volume -= ( cptr->volumeslide & 0x0F );

					if( cptr->volume > 63 )
						cptr->volume = 0;
				}
			}
		break;

		case EFFECT_VOLSLIDE_VIBRATO:
		case EFFECT_VIBRATO:

			cptr->vibraperiod = ( (cptr->vibraparam&0xF) * sintable[cptr->vibrapointeur&0x1F] )>>7;

			if( cptr->vibrapointeur > 31 )
				cptr->vibraperiod = -cptr->vibraperiod;

			cptr->vibrapointeur = ( cptr->vibrapointeur + ( ( cptr->vibraparam>>4 ) & 0x0F) ) & 0x3F;

			if( cptr->effect == EFFECT_VOLSLIDE_VIBRATO )
			{
				if( cptr->volumeslide & 0xF0 )
				{
					cptr->volume += ( cptr->volumeslide >> 4 );

					if( cptr->volume > 64 )
						cptr->volume = 64;
				}
				else
				{
					cptr->volume -= cptr->volumeslide;

					if( cptr->volume > 64 )
						cptr->volume = 0;
				}
			}

		break;

		case EFFECT_VOLUME_SLIDE:

			if( cptr->volumeslide & 0xF0 )
			{
				cptr->volume += ( cptr->volumeslide >> 4 );

				if( cptr->volume > 64 )
					cptr->volume = 64;
			}
			else
			{
				cptr->volume -= cptr->volumeslide;

				if( cptr->volume > 64 )
					cptr->volume = 0;
			}
		break;

		case EFFECT_EXTENDED:
			switch( cptr->parameffect >> 4 )
			{

				case EFFECT_E_NOTE_CUT:
					if( cptr->cut_param )
						cptr->cut_param--;

					if( !cptr->cut_param )
						cptr->volume = 0;
				break;

				case EFFECT_E_RETRIGGER_NOTE:
					cptr->retrig_cnt++;
					if( cptr->retrig_cnt >= cptr->retrig_param )
					{
						cptr->retrig_cnt = 0;

						cptr->sampdata = cptr->lst_sampdata;
						cptr->length = cptr->lst_length;
						cptr->reppnt = cptr->lst_reppnt;
						cptr->replen = cptr->lst_replen;
						cptr->samppos = 0;
					}
				break;

				case EFFECT_E_NOTE_DELAY:
					if( cptr->note_delay )
					{
						if( ( cptr->note_delay - 1 ) == modctx->tick_cnt )
						{
							cptr->sampdata = cptr->dly_sampdata;
							cptr->length = cptr->dly_length;
							cptr->reppnt = cptr->dly_reppnt;
							cptr->replen = cptr->dly_replen;

							cptr->lst_sampdata = cptr->sampdata;
							cptr->lst_length = cptr->length;
							cptr->lst_reppnt = cptr->reppnt;
							cptr->lst_replen = cptr->replen;
							cptr->note_delay = 0;
						}
					}
				break;
				default:
				break;
			}
		break;

		default:
		break;

	}

}

///////////////////////////////////////////////////////////////////////////////////
int hxcmod_init(modcontext * modctx)
{
	muint i,j;

	if( modctx )
	{
		memclear(modctx,0,sizeof(modcontext));
		modctx->playrate = 44100;
		modctx->stereo = 1;
		modctx->stereo_separation = 1;
		modctx->bits = 16;
		modctx->filter = 1;

		for(i=0;i<PERIOD_TABLE_LENGTH - 1;i++)
		{
			for(j=0;j<8;j++)
			{
				modctx->fullperiod[(i*8) + j] = periodtable[i] - ((( periodtable[i] - periodtable[i+1] ) / 8) * j);
			}
		}

		return 1;
	}

	return 0;
}

int hxcmod_setcfg(modcontext * modctx, int samplerate, int stereo_separation, int filter)
{
	if( modctx )
	{
		modctx->playrate = samplerate;

		if(stereo_separation < 4)
		{
			modctx->stereo_separation = stereo_separation;
		}

		if( filter )
			modctx->filter = 1;
		else
			modctx->filter = 0;

		return 1;
	}

	return 0;
}

int hxcmod_load( modcontext * modctx, void * mod_data, int mod_data_size )
{
	muint i, max;
	unsigned short t;
	sample *sptr;
	unsigned char * modmemory,* endmodmemory;

	modmemory = (unsigned char *)mod_data;
	endmodmemory = modmemory + mod_data_size;

	if(modmemory)
	{
		if( modctx )
		{
#ifdef FULL_STATE
			memclear(&(modctx->effects_event_counts),0,sizeof(modctx->effects_event_counts));
#endif
			memcopy(&(modctx->song.title),modmemory,1084);

			i = 0;
			modctx->number_of_channels = 0;
			while(modlist[i].numberofchannels)
			{
				if(memcompare(modctx->song.signature,modlist[i].signature,4))
				{
					modctx->number_of_channels = modlist[i].numberofchannels;
				}

				i++;
			}

			if( !modctx->number_of_channels )
			{
				// 15 Samples modules support
				// Shift the whole datas to make it look likes a standard 4 channels mod.
				memcopy(&(modctx->song.signature), "M.K.", 4);
				memcopy(&(modctx->song.length), &(modctx->song.samples[15]), 130);
				memclear(&(modctx->song.samples[15]), 0, 480);
				modmemory += 600;
				modctx->number_of_channels = 4;
			}
			else
			{
				modmemory += 1084;
			}

			if( modmemory >= endmodmemory )
				return 0; // End passed ? - Probably a bad file !

			// Patterns loading
			for (i = max = 0; i < 128; i++)
			{
				while (max <= modctx->song.patterntable[i])
				{
					modctx->patterndata[max] = (note*)modmemory;
					modmemory += (256*modctx->number_of_channels);
					max++;

					if( modmemory >= endmodmemory )
						return 0; // End passed ? - Probably a bad file !
				}
			}

			for (i = 0; i < 31; i++)
				modctx->sampledata[i]=0;

			// Samples loading
			for (i = 0, sptr = modctx->song.samples; i <31; i++, sptr++)
			{
				t= (sptr->length &0xFF00)>>8 | (sptr->length &0xFF)<<8;
				sptr->length = t*2;

				t= (sptr->reppnt &0xFF00)>>8 | (sptr->reppnt &0xFF)<<8;
				sptr->reppnt = t*2;

				t= (sptr->replen &0xFF00)>>8 | (sptr->replen &0xFF)<<8;
				sptr->replen = t*2;


				if (sptr->length == 0) continue;

				modctx->sampledata[i] = (mchar*)modmemory;
				modmemory += sptr->length;

				if (sptr->replen + sptr->reppnt > sptr->length)
					sptr->replen = sptr->length - sptr->reppnt;

				if( modmemory > endmodmemory )
					return 0; // End passed ? - Probably a bad file !
			}

			// States init

			modctx->tablepos = 0;
			modctx->patternpos = 0;
			modctx->song.speed = 6;
			modctx->bpm = 125;
			modctx->samplenb = 0;

			modctx->patternticks = (((long)modctx->song.speed * modctx->playrate * 5)/ (2 * modctx->bpm)) + 1;
			modctx->patternticksaim = ((long)modctx->song.speed * modctx->playrate * 5) / (2 * modctx->bpm);

			modctx->sampleticksconst = 3546894UL / modctx->playrate; //8448*428/playrate;

			for(i=0; i < modctx->number_of_channels; i++)
			{
				modctx->channels[i].volume = 0;
				modctx->channels[i].period = 0;
			}

			modctx->mod_loaded = 1;

			return 1;
		}
	}

	return 0;
}

void hxcmod_fillbuffer( modcontext * modctx, msample * outbuffer, unsigned long nbsample, tracker_buffer_state * trkbuf )
{
	unsigned long i, j;
	unsigned long k;
	unsigned char c;
	unsigned int state_remaining_steps;
#ifndef HXCMOD_MONO_OUTPUT
	int l,ll,tl;
#endif
	int r,lr,tr;

	short finalperiod;
	note	*nptr;
	channel *cptr;

	if( modctx && outbuffer )
	{
		if(modctx->mod_loaded)
		{
			state_remaining_steps = 0;

			if( trkbuf )
			{
				trkbuf->cur_rd_index = 0;

				memcopy(trkbuf->name,modctx->song.title,sizeof(modctx->song.title));

				for(i=0;i<31;i++)
				{
					memcopy(trkbuf->instruments[i].name,modctx->song.samples[i].name,sizeof(trkbuf->instruments[i].name));
				}
			}

#ifndef HXCMOD_MONO_OUTPUT
			ll = modctx->last_l_sample;
#endif
			lr = modctx->last_r_sample;

			for (i = 0; i < nbsample; i++)
			{
				//---------------------------------------
				if( modctx->patternticks++ > modctx->patternticksaim )
				{
					if( !modctx->patterndelay )
					{
						nptr = modctx->patterndata[modctx->song.patterntable[modctx->tablepos]];
						nptr = nptr + modctx->patternpos;
						cptr = modctx->channels;

						modctx->tick_cnt = 0;

						modctx->patternticks = 0;
						modctx->patterntickse = 0;

						for(c=0;c<modctx->number_of_channels;c++)
						{
							worknote((note*)(nptr+c), (channel*)(cptr+c),(char)(c+1),modctx);
						}

						if( !modctx->jump_loop_effect )
							modctx->patternpos += modctx->number_of_channels;
						else
							modctx->jump_loop_effect = 0;

						if( modctx->patternpos == 64*modctx->number_of_channels )
						{
							modctx->tablepos++;
							modctx->patternpos = 0;
							if(modctx->tablepos >= modctx->song.length)
								modctx->tablepos = 0;
						}
					}
					else
					{
						modctx->patterndelay--;
						modctx->patternticks = 0;
						modctx->patterntickse = 0;
						modctx->tick_cnt = 0;
					}

				}

				if( modctx->patterntickse++ > (modctx->patternticksaim/modctx->song.speed) )
				{
					nptr = modctx->patterndata[modctx->song.patterntable[modctx->tablepos]];
					nptr = nptr + modctx->patternpos;
					cptr = modctx->channels;

					for(c=0;c<modctx->number_of_channels;c++)
					{
						workeffect( modctx, nptr+c, cptr+c );
					}

					modctx->tick_cnt++;
					modctx->patterntickse = 0;
				}

				//---------------------------------------

				if( trkbuf && !state_remaining_steps )
				{
					if( trkbuf->nb_of_state < trkbuf->nb_max_of_state )
					{
						memclear(&trkbuf->track_state_buf[trkbuf->nb_of_state],0,sizeof(tracker_state));
					}
				}

#ifndef HXCMOD_MONO_OUTPUT
				l=0;
#endif
				r=0;

				for(j =0, cptr = modctx->channels; j < modctx->number_of_channels ; j++, cptr++)
				{
					if( cptr->period != 0 )
					{
						finalperiod = cptr->period - cptr->decalperiod - cptr->vibraperiod;
						if( finalperiod )
						{
							cptr->samppos += ( (modctx->sampleticksconst<<10) / finalperiod );
						}

						cptr->ticks++;

						if( cptr->replen<=2 )
						{
							if( ( cptr->samppos >> 10) >= cptr->length )
							{
								cptr->length = 0;
								cptr->reppnt = 0;

								if(cptr->update_nxt_repeat)
								{
									cptr->replen = cptr->nxt_replen;
									cptr->reppnt = cptr->nxt_reppnt;
									cptr->sampdata = cptr->nxt_sampdata;
									cptr->length = cptr->nxt_length;

									cptr->lst_sampdata = cptr->sampdata;
									cptr->lst_length = cptr->length;
									cptr->lst_reppnt = cptr->reppnt;
									cptr->lst_replen = cptr->replen;

									cptr->update_nxt_repeat = 0;
								}

								if( cptr->length )
									cptr->samppos = cptr->samppos % (((unsigned long)cptr->length)<<10);
								else
									cptr->samppos = 0;
							}
						}
						else
						{
							if( ( cptr->samppos >> 10 ) >= (unsigned long)(cptr->replen+cptr->reppnt) )
							{
								if( cptr->update_nxt_repeat )
								{
									cptr->replen = cptr->nxt_replen;
									cptr->reppnt = cptr->nxt_reppnt;
									cptr->sampdata = cptr->nxt_sampdata;
									cptr->length = cptr->nxt_length;

									cptr->lst_sampdata = cptr->sampdata;
									cptr->lst_length = cptr->length;
									cptr->lst_reppnt = cptr->reppnt;
									cptr->lst_replen = cptr->replen;

									cptr->update_nxt_repeat = 0;
								}

								if( cptr->sampdata )
								{
									cptr->samppos = ((unsigned long)(cptr->reppnt)<<10) + (cptr->samppos % ((unsigned long)(cptr->replen+cptr->reppnt)<<10));
								}
							}
						}

						k = cptr->samppos >> 10;

#ifdef HXCMOD_MONO_OUTPUT
						if( cptr->sampdata!=0 )
						{
							r += ( cptr->sampdata[k] *  cptr->volume );
						}
#else
						if( cptr->sampdata!=0 && ( ((j&3)==1) || ((j&3)==2) ) )
						{
							r += ( cptr->sampdata[k] *  cptr->volume );
						}

						if( cptr->sampdata!=0 && ( ((j&3)==0) || ((j&3)==3) ) )
						{
							l += ( cptr->sampdata[k] *  cptr->volume );
						}
#endif

						if( trkbuf && !state_remaining_steps )
						{
							if( trkbuf->nb_of_state < trkbuf->nb_max_of_state )
							{
								trkbuf->track_state_buf[trkbuf->nb_of_state].number_of_tracks = modctx->number_of_channels;
								trkbuf->track_state_buf[trkbuf->nb_of_state].buf_index = i;
								trkbuf->track_state_buf[trkbuf->nb_of_state].cur_pattern = modctx->song.patterntable[modctx->tablepos];
								trkbuf->track_state_buf[trkbuf->nb_of_state].cur_pattern_pos = modctx->patternpos / modctx->number_of_channels;
								trkbuf->track_state_buf[trkbuf->nb_of_state].cur_pattern_table_pos = modctx->tablepos;
								trkbuf->track_state_buf[trkbuf->nb_of_state].bpm = modctx->bpm;
								trkbuf->track_state_buf[trkbuf->nb_of_state].speed = modctx->song.speed;
								trkbuf->track_state_buf[trkbuf->nb_of_state].tracks[j].cur_effect = cptr->effect_code;
								trkbuf->track_state_buf[trkbuf->nb_of_state].tracks[j].cur_parameffect = cptr->parameffect;
								trkbuf->track_state_buf[trkbuf->nb_of_state].tracks[j].cur_period = finalperiod;
								trkbuf->track_state_buf[trkbuf->nb_of_state].tracks[j].cur_volume = cptr->volume;
								trkbuf->track_state_buf[trkbuf->nb_of_state].tracks[j].instrument_number = (unsigned char)cptr->sampnum;
							}
						}
					}
				}

				if( trkbuf && !state_remaining_steps )
				{
					state_remaining_steps = trkbuf->sample_step;

					if(trkbuf->nb_of_state < trkbuf->nb_max_of_state)
						trkbuf->nb_of_state++;
				}
				else
				{
					state_remaining_steps--;
				}

#ifdef HXCMOD_MONO_OUTPUT
				tr = (short)r;

				if ( modctx->filter )
				{
					// Filter
					r = (r+lr)>>1;
				}

				// Level limitation
				if( r > 32767 ) r = 32767;
				if( r < -32768 ) r = -32768;

				// Store the final sample.
	#ifdef HXCMOD_8BITS_OUTPUT

		#ifdef HXCMOD_UNSIGNED_OUTPUT
				outbuffer[i] = (r >> 8) + 127;
		#else
				outbuffer[i] = r >> 8;
		#endif

	#else

		#ifdef HXCMOD_UNSIGNED_OUTPUT
				outbuffer[i] = r + 32767;
		#else
				outbuffer[i] = r;
		#endif

	#endif

				lr = tr;
#else
				tl = (short)l;
				tr = (short)r;

				if ( modctx->filter )
				{
					// Filter
					l = (l+ll)>>1;
					r = (r+lr)>>1;
				}

				if ( modctx->stereo_separation == 1 )
				{
					// Left & Right Stereo panning
					l = (l+(r>>1));
					r = (r+(l>>1));
				}

				// Level limitation
				if( l > 32767 ) l = 32767;
				if( l < -32768 ) l = -32768;
				if( r > 32767 ) r = 32767;
				if( r < -32768 ) r = -32768;

				// Store the final sample.


	#ifdef HXCMOD_8BITS_OUTPUT

		#ifdef HXCMOD_UNSIGNED_OUTPUT
				outbuffer[(i*2)]   = ( l >> 8 ) + 127;
				outbuffer[(i*2)+1] = ( r >> 8 ) + 127;
		#else
				outbuffer[(i*2)]   = l >> 8;
				outbuffer[(i*2)+1] = r >> 8;
		#endif

	#else

		#ifdef HXCMOD_UNSIGNED_OUTPUT
				outbuffer[(i*2)]   = l + 32767;
				outbuffer[(i*2)+1] = r + 32767;
		#else
				outbuffer[(i*2)]   = l;
				outbuffer[(i*2)+1] = r;
		#endif

	#endif
				ll = tl;
				lr = tr;
#endif // HXCMOD_MONO_OUTPUT

			}

#ifndef HXCMOD_MONO_OUTPUT
			modctx->last_l_sample = ll;
#endif
			modctx->last_r_sample = lr;

			modctx->samplenb = modctx->samplenb+nbsample;
		}
		else
		{
			for (i = 0; i < nbsample; i++)
			{
				// Mod not loaded. Return blank buffer.
#ifdef HXCMOD_MONO_OUTPUT
				outbuffer[i] = 0;
#else
				outbuffer[(i*2)]   = 0;
				outbuffer[(i*2)+1] = 0;
#endif
			}

			if(trkbuf)
			{
				trkbuf->nb_of_state = 0;
				trkbuf->cur_rd_index = 0;
				trkbuf->name[0] = 0;
				memclear(trkbuf->track_state_buf,0,sizeof(tracker_state) * trkbuf->nb_max_of_state);
				memclear(trkbuf->instruments,0,sizeof(trkbuf->instruments));
			}
		}
	}
}

void hxcmod_unload( modcontext * modctx )
{
	if(modctx)
	{
		memclear(&modctx->song,0,sizeof(modctx->song));
		memclear(&modctx->sampledata,0,sizeof(modctx->sampledata));
		memclear(&modctx->patterndata,0,sizeof(modctx->patterndata));
		modctx->tablepos = 0;
		modctx->patternpos = 0;
		modctx->patterndelay  = 0;
		modctx->jump_loop_effect = 0;
		modctx->bpm = 0;
		modctx->patternticks = 0;
		modctx->patterntickse = 0;
		modctx->patternticksaim = 0;
		modctx->sampleticksconst = 0;

		modctx->samplenb = 0;

		memclear(modctx->channels,0,sizeof(modctx->channels));

		modctx->number_of_channels = 0;

		modctx->mod_loaded = 0;

		modctx->last_r_sample = 0;
		modctx->last_l_sample = 0;
	}
}
