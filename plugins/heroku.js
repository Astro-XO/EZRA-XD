const got = require("got");
const Heroku = require("heroku-client");
const { command, isPrivate, tiny } = require("../lib/");
const Config = require("../config");
const heroku = new Heroku({ token: Config.HEROKU_API_KEY });
const baseURI = "/apps/" + Config.HEROKU_APP_NAME;
const simpleGit = require("simple-git");
const { secondsToDHMS } = require("../lib");
const git = simpleGit();
const exec = require("child_process").exec;
const { SUDO } = require("../config");


command(
  {
    pattern: "restart",
    fromMe: true,
    type: "heroku",
    desc: "Restart Dyno",
    type: "heroku",
  },
  async (message) => {
    await message.sendMessage(`_Restarting!_`);
    await heroku.delete(baseURI + "/dynos").catch(async (error) => {
      await message.sendMessage(`HEROKU : ${error.body.message}`);
    });
  }
);


command(
  {
    pattern: "update",
    fromMe: true,
    type: "heroku",
    desc: "Checks for update.",
  },
  async (message, match,) => {
    let {prefix} = message
    if (match === "now") {
      await git.fetch();
      var commits = await git.log([
        Config.BRANCH + "..origin/" + Config.BRANCH,
      ]);
      if (commits.total === 0) {
        return await message.sendMessage("*Bot update available_");
      } else {
        await message.reply{"_Updating_");

        try {
          var app = await heroku.get("/apps/" + Config.HEROKU_APP_NAME);
        } catch {
          await message.sendMessage("_Invalid Heroku_");
          await new Promise((r) => setTimeout(r, 1000));
        }

        git.fetch("upstream", Config.BRANCH);
        git.reset("hard", ["FETCH_HEAD"]);

        var git_url = app.git_url.replace(
          "https://",
          "https://api:" + Config.HEROKU_API_KEY + "@"
        );

        try {  
          await git.addRemote("heroku", git_url);
        } catch {
          console.log("heroku remote error");
        }
        await git.push("heroku", Config.BRANCH);

        await message.sendMessage("_Updated_");
      }
    }
    await git.fetch();
    var commits = await git.log([Config.BRANCH + "..origin/" + Config.BRANCH]);
    if (commits.total === 0) {
      await message.sendMessage("_Updates not Available_");
    } else {
      var availupdate = "_Updates_ \n\n";
      commits["all"].map((commit, num) => {
        availupdate += num + 1 + " $ " + (commit.message) + "\n";
      });
      return await message.client.sendMessage(message.jid, {
        text: availupdate,
        footer: ("update now"),
      });
    }
  }
);


        

command(
  {
    pattern: "update now",
    fromMe: true,
    type: "heroku",
    desc: "Updates the bot",
  },
  async (message) => {}
);

//Credits Zeta-X0
//created by Abhiy

command(
  { pattern: "getsudo ?(.*)", 
    fromMe: isPrivate, 
    desc: "shows sudo numbers", 
    type: "heroku" 
  },
  async (message, match, mm) => {
    const vars = await heroku
      .get(baseURI + "/config-vars")
      .catch(async (error) => {
        return await message.send("HEROKU : " + error.body.message);
      });
    await message.sendMessage("```" + `SUDO number are : ${config.SUDO}` + "```");
  }
);

command(
  { pattern: "setsudo ?(.*)", fromMe: isPrivate, desc: "set new sudo", type: "heroku" },
  async (message, mm) => {
    var newSudo = (message.reply_message ? message.reply_message.jid : "" || mm).split(
      "@"
    )[0];
    if (!newSudo)
      return await message.sendMessage("*Need reply/mention/number*", { quoted: message });
    var setSudo = (SUDO + "," + newSudo).replace(/,,/g, ",");
    setSudo = setSudo.startsWith(",") ? setSudo.replace(",", "") : setSudo;
    await message.sendMessage("```new sudo numbers are: ```" + setSudo, {
      quoted: message,
    });
    await message.sendMessage("_It takes 30 seconds to make effect_", { quoted: message });
    await heroku
      .patch(baseURI + "/config-vars", { body: { SUDO: setSudo } })
      .then(async (app) => {});
  }
);
