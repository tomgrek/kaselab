var fs = require('fs');
var path = require('path');

function configFilePath() {
  var home = process.env.HOME || process.env.USERPROFILE;
  var confFilePath = path.join(home, '.kaselab.conf.json');
  return confFilePath;
}
function readConfig() {
  var configFile = fs.readFileSync(configFilePath());
  return JSON.parse(configFile);
};
function writeConfig(config) {
  fs.writeFileSync(configFilePath(), JSON.stringify(config, null, '\t'));
};
function checkOrCreateConfig() {
  if (!fs.existsSync(configFilePath())) {
    var config = {
      activeProject: null,
      projects: [],
      time: [],
      user: {}
    };
    writeConfig(config);
  }
};
function cleanUpAndQuit() {
  process.exit(0);
};
function findOne(collection, key, id) {
  return collection.filter(function(item) {
    return item[key] === id;
  })[0] || null;
};
function findAll(collection, key, id) {
  return collection.filter(function(item) {
    return item[key] === id;
  }) || null;
};
function getInput(prompt, cb) {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: prompt + ' ',
    terminal: false
  });
  rl.prompt();
  rl.on('line', function(line) {
    rl.close();
    cb(line);
  });
};
function parseTime(time) {
  time = new Date(time);
  return time.getUTCHours() + ' hrs ' + time.getUTCMinutes() + ' mins';
};

checkOrCreateConfig();
try {

switch(process.argv[2]) {
  case 'new' : {
    if (process.argv.length < 4) throw 'New what?\nMaybe you meant "kaselab new project [name]"';
    switch (process.argv[3]) {
      case 'project' : {
        if (!process.argv[4]) throw 'You need to specify a project name';
        var config = readConfig();
        var newProject = {
          name: process.argv[4]
        };
        config.activeProject = newProject.name;
        if (findOne(config.projects, 'name', newProject.name)) throw 'That project already exists.';
        getInput('Any project reference? [no]', function(ref) {
          newProject.ref = ref;
          newProject.initiated = new Date();
          getInput('Any client? [no]', function(client) {
            newProject.client = client;
            if (client !== '') {
              getInput('Does client have its own reference? [no]', function (cliRef) {
                newProject.clientRef = cliRef;
                config.projects.push(newProject);
                writeConfig(config);
                console.log("Successfully created "+newProject.name+" and set it as the active project");
              });
            } else {
              newProject.clientRef = '';
              config.projects.push(newProject);
              writeConfig(config);
              console.log("Successfully created "+newProject.name+" and set it as the active project");
            }
          });
        });
        break;
      }
      default : {
        throw 'Cannot create a new '+process.argv[3];
        break;
      }
    }
    break;
  }
  case 'use' : {
    if (process.argv.length < 4) throw 'Use what?\nMaybe you meant "kaselab use [project name]"';
    var config = readConfig();
    if (!findOne(config.projects, 'name', process.argv[3])) throw `That project doesn't exist`;
    var activeTimer = config.time[config.time.length-1];
    if (activeTimer && !activeTimer.stop) throw 'You have a timer in progress on '+config.activeProject+', stop it first.\n';
    config.activeProject = process.argv[3];
    writeConfig(config);
    console.log("Successfully set active project to "+process.argv[3]);
    break;
  }
  case 'timer' : {
    if (process.argv.length < 4) throw 'Start or stop?\nMaybe you meant "kaselab timer start"';
    var config = readConfig();
    switch (process.argv[3]) {
      case 'start': {
        var activeTimer = config.time[config.time.length-1];
        if (activeTimer && !activeTimer.stop) throw 'You have a timer in progress on '+config.activeProject+', stop it first.\nIn case of errors, you may need to edit ~/.kaselab.conf.json';
        var timer = {
          start: new Date(),
          project: config.activeProject
        };
        console.log('Started timer on '+config.activeProject);
        config.time.push(timer);
        writeConfig(config);
        break;
      }
      case 'stop': {
        var activeTimer = config.time[config.time.length-1];
        if (activeTimer.project !== config.activeProject) throw 'You are currently working on '+config.activeProject+', but the active timer is for '+activeTimer.project+'.\nYou may need to edit ~/.kaselab.conf.json';
        if (process.argv.length < 5) {
          getInput('Description of what you did: [working]', function(desc) {
            if (!desc || desc === '') desc = "Working";
            config.time[config.time.length-1] = Object.assign(activeTimer, {stop: new Date(), description: desc});
            writeConfig(config);
            console.log('Stopped timer on '+config.activeProject);
          });
        } else {
          config.time[config.time.length-1] = Object.assign(activeTimer, {stop: new Date(), description: process.argv[4]});
          console.log('Stopped timer on '+config.activeProject);
          writeConfig(config);
        }
        break;
      }
      default: {
        throw 'Start or stop?\nMaybe you meant "kaselab timer start"';
        break;
      }
    }
    break;
  }
  case 'report': {
    if (process.argv.length < 4) throw 'Report on which project?\nMaybe you meant "kaselab report [project name]"';
    var config = readConfig();
    var project = findOne(config.projects, 'name', process.argv[3]);
    if (!project) throw `That project doesn't exist`;
    var timers = findAll(config.time, 'project', project.name);
    var totalTime = timers.reduce((acc, x) => {
      if (!x.stop) throw 'You have an open timer\nUse kaselab timer stop or edit ~/.kaselab.conf.json';
      acc += new Date(x.stop) - new Date(x.start);
      return acc;
    }, 0);
    var dateSpan = new Date(timers[timers.length-1].stop).getDate() - new Date(timers[0].start).getDate();
    console.log("Time report for project "+project.name);
    var refString = '';
    if (project.ref !== '') refString += 'Reference: '+project.ref+"\n";
    if (project.client !== '') refString += 'Client: '+project.client;
    if (project.clientRef !== '') refString += ' (client ref: '+project.clientRef+")\n";
    if (refString !== '') console.log(refString);
    console.log("---------------------");
    console.log("Project initiated: "+project.initiated);
    console.log("Total time: " + parseTime(totalTime) + ' over ' + dateSpan + ' days.');
    console.log("---------------------");
    console.log("Date\t\t\tStart\tEnd\tDescription");
    timers.map(timer => {
      var startTime = new Date(timer.start);
      var endTime = new Date(timer.stop);
      console.log(startTime.toDateString()+'\t\t'+startTime.getHours()+':'+startTime.getMinutes()+'\t'+endTime.getHours()+':'+endTime.getMinutes());

    });
    break;
  }
  default : {
    console.log("Error processing that command - try 'kaselab help'");
    cleanUpAndQuit();
    break;
  }
}

} catch(error) {
  console.log('Error processing that command.\nSpecifically: '+error+'\n');
  cleanUpAndQuit();
}
