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

function AUDIO_BUFFER_SIZE() {
	return 16384;
}

function HxCMOD_emscript_js()
{
	this.context = new HxCMODAudioContext;
	this.currentModNode = null;
}

HxCMOD_emscript_js.prototype.createHxCMODNode = function(buffer)
{
	var audiobufsize = AUDIO_BUFFER_SIZE();
	var ModNode = this.context.createScriptProcessor(audiobufsize, 0, 2);

	ModNode.player = this;

	var byteFileArray = new Int8Array(buffer);

	var pointerToMod = Module._malloc(byteFileArray.byteLength);

	Module.HEAPU8.set(byteFileArray, pointerToMod);

	ModNode.moduleCtx = Module._loadMod(pointerToMod, byteFileArray.byteLength, this.context.sampleRate);
	ModNode.leftFloatChannelPtr  = Module._malloc(4 * audiobufsize);
	ModNode.rightFloatChannelPtr = Module._malloc(4 * audiobufsize);
	ModNode.leftChannel = new Float32Array(Module.HEAPF32.buffer, ModNode.leftFloatChannelPtr, audiobufsize);
	ModNode.rightChannel = new Float32Array(Module.HEAPF32.buffer, ModNode.rightFloatChannelPtr, audiobufsize);

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
		var outputLeftChannel  = e.outputBuffer.getChannelData(0);
		var outputRightChannel = e.outputBuffer.getChannelData(1);

		var sampleToRender = AUDIO_BUFFER_SIZE();

		Module._getNextSoundData(this.moduleCtx,this.leftFloatChannelPtr, this.rightFloatChannelPtr, sampleToRender);

		for (var i = 0; i < sampleToRender; ++i)
		{
			outputLeftChannel[i]  = ModNode.leftChannel[i];
			outputRightChannel[i] = ModNode.rightChannel[i];
		}

		/*
		// copyToChannel unsupported by chromium...
		Module._getNextSoundData(this.moduleCtx,this.leftFloatChannelPtr, this.rightFloatChannelPtr, 16384);

		e.outputBuffer.copyToChannel(ModNode.leftChannel, 0);
		e.outputBuffer.copyToChannel(ModNode.rightChannel, 1);
		*/
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
