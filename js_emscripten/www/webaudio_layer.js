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
// File : webaudio_layer.js
// Contains: MOD Loading and web audio sound manager
//
// Written by: Jean François DEL NERO
//
///////////////////////////////////////////////////////////////////////////////////

if('webkitAudioContext' in window)
{
	HxCMODAudioContext = webkitAudioContext;
}
else
{
	if('AudioContext' in window)
	{
		HxCMODAudioContext = AudioContext;
	}
}

function HxCMOD_emscript_js()
{
	this.context = new HxCMODAudioContext;
	this.currentModNode = null;
}

HxCMOD_emscript_js.prototype.createHxCMODNode = function(buffer)
{
	var ModNode = this.context.createScriptProcessor(16384, 0, 2);

	ModNode.player = this;

	var byteFileArray = new Int8Array(buffer);

	var pointerToMod = Module._malloc(byteFileArray.byteLength);

	Module.HEAPU8.set(byteFileArray, pointerToMod);

	ModNode.moduleCtx = Module._loadMod(pointerToMod, byteFileArray.byteLength, this.context.sampleRate);
	ModNode.leftFloatChannelPtr  = Module._malloc(4 * 16384);
	ModNode.rightFloatChannelPtr = Module._malloc(4 * 16384);
	ModNode.leftChannel = new Float32Array(Module.HEAPF32.buffer, ModNode.leftFloatChannelPtr, 16384);
	ModNode.rightChannel = new Float32Array(Module.HEAPF32.buffer, ModNode.rightFloatChannelPtr, 16384);

	ModNode.cleanup = function()
	{
		if (this.moduleCtx != 0)
		{
			Module._unloadMod( this.moduleCtx );
			this.moduleCtx = 0;
		}

		if (this.leftFloatChannelPtr != 0)
		{
			Module._free(this.leftFloatChannelPtr);
			this.leftFloatChannelPtr = 0;
		}

		if (this.rightFloatChannelPtr != 0)
		{
			Module._free(this.rightFloatChannelPtr);
			this.rightFloatChannelPtr = 0;
		}
	}

	ModNode.onaudioprocess = function(e)
	{
		Module._getNextSoundData(this.moduleCtx,this.leftFloatChannelPtr, this.rightFloatChannelPtr, 16384);

		e.outputBuffer.copyToChannel(ModNode.leftChannel, 0);
		e.outputBuffer.copyToChannel(ModNode.rightChannel, 1);
	}

	return ModNode;
}

HxCMOD_emscript_js.prototype.load = function(input, callback)
{
	var player = this;
	if (input instanceof File)
	{
		// Local file
		var reader = new FileReader();

		reader.onload = function()
		{
			return callback(reader.result);
		}.bind(this);

		reader.readAsArrayBuffer(input);
	}
	else
	{
		// "Http" File.
		var XmlHttpReq = new XMLHttpRequest();

		XmlHttpReq.open('GET', input, true);
		XmlHttpReq.responseType = 'arraybuffer';
		XmlHttpReq.onload = function(e)
		{
			if (XmlHttpReq.status === 200)
			{
				return callback(XmlHttpReq.response);
			}
		}.bind(this);
		XmlHttpReq.send();
	}
}

HxCMOD_emscript_js.prototype.play = function(buffer)
{
	this.stop();

	var ModNode = this.createHxCMODNode(buffer);
	if (ModNode == null)
	{
		return;
	}

	this.currentModNode = ModNode;

	ModNode.connect(this.context.destination);
}

HxCMOD_emscript_js.prototype.stop = function()
{
	if (this.currentModNode != null)
	{
		this.currentModNode.disconnect();
		this.currentModNode.cleanup();
		this.currentModNode = null;
	}
}
