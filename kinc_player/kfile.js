let project = new Project('hxcmodplayer_kinc');

project.cpp = false;
project.cStd = "c99"

await project.addProject('PATH TO/Kinc');

// -- comment out if you don't want visual output for player
project.addDefine('USE_TRACKBUFFER') 
project.addFile('../framegenerator.c');
project.addFile('../packer/*.c');
// ---------------------------------------------------------
project.addFile('src/*.c');
project.addFile('../hxcmod.c');

project.setDebugDir('Deployment');

project.flatten();

resolve(project);
