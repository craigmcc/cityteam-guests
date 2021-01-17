# INSTALLATION

Installing and operating the CityTeam Guests Application requires installing a number
of prerequisite software packages.  All of them are available at no cost, and
nearly all of the software is open source.  (This application could not have been
developed without the extremely rich technologies made available by open source
communities -- thanks to all of them!).

These instructions are primarily oriented towards a Windows 10 environment, but the
software was developed (and extensively tested) on Mac OSX, and should run fine on
any Linux/Unix platform as well.  The steps can be performed by anyone not afraid
of slightly geeky steps, but assistance from IT-oriented folks would be a good idea.

## (0) PLANNING

In addition to the dependencies, there are two primary components to be installed:
  * Database - The persistent data store maintained behind the scenes, and from which
backups must be periodically captured.
  * Application - The server application, which receives and processes requests
    from the client application (downloaded to the user's browser upon access)
    and interacts with the data in the database in order to compose responses.
    
It is perfectly feasible to run both components on a single system (any modern
laptop with a few gigabytes of main memory and sufficient disk space) to support
more than one user, and (optionally) more than one CityTeam Facility.  It is also
feasible to separate the two components onto different systems.  To clearly
distinguish the two environments, they will be described as **Database Server**
and **Application Server**, which may or may not be on the same physical computer.

In both cases, it is preferable that the server environments are connected to the
Internet in order to make installation of upgraded software versions feasible.
However, this is **not** required during the normal operation of the application.
For that, it is only required that the system where users interact with the
application has network connectivity to the **Application Server** (if it is
physically separate), and that the **Application Server** have network connectivity
to the **Database Server** (again, if it is physically separate).  If the user
and both servers are all running on the same physical system, no network
connectivity at all is required, although you would be limited to a single user
in this scenario.

In the instructions below, version numbers in square brackets will generally indicate
the latest version available when these instructions were written.

## (1) WINDOWS UPDATE AND CONFIGURATION

Applicability:  **Database Server** and **Application Server**.

- Download and install any Windows 10 updates that have not yet been performed.
  This will generally require a reboot
- We will need to install applications from locations other than the Microsoft
  App Store, so we must turn off the "safe download" mode.
    - TODO - details on how to do this.
- Verify that this worked:
    - Click *Windows+R* and type *cmd*.
    - You should get a new window with a command prompt.
    - You can close this window for now.  We will create them later as needed.
    
## (2) INSTALL POSTGRES DATABASE

Applicability:  *Database Server*.

- Download [Postgres](https://postgresql.org/download/windows).
- Pick the latest production version for the 64 bit platform [13.1
  ]
- Click the downloaded file to execute it.
- During installation, select all of the components **except** Stack Builder
  (which is not relevant for our needs).
- During installation, you will be required to pick a master password
  for the database environment.  **PICK SOMETHING MEMORABLE, DIFFERENT
  THAN ANY OTHER PASSWORD YOU ARE USING, AND WRITE IT DOWN!**.  This will be
  required later if you ever wish to administer or upgrade the database.
- Verify that this worked:
    - Click *Windows+R* and type *services*.
    - You should see a list of the service applications running on your system.
    - Scroll down the list and verify that **postgresql-x64-13** is present
      (the version number might be different depending on what you downloaded).
- Add the Postgres Binaries to your Application Path:
    - Click *Windows+R* and type "env".
    - In the "User Variables for #####" (your user id), double click "Path".
    - Click "New", and add an entry for *C:\Program Files\PostgreSQL\13\bin*
      (the version number might be different depending on what you downloaded).
- Verify that this worked:
    - Close any Command Prompt window you have open.
    - Click *Windows+R* and type *cmd* to open a new Command Prompt window.
    - Type *psql --version* and press *Enter*.
    - You should see an identifier for the version you installed [psql (PostgreSQL) 13.1].

Applicability:  *Application Server*.

If you are installing the *Database Server* and *Application Server* on separate
physical systems, repeat the steps listed above on the *Application Server*,
but only install the command line tools portion of Postgres.  These tools are
required to initiate database backups and other similar operations.

## (2) INSTALL PREREQUISITE SOFTWARE

Applicability:  *Application Server*.

All of these software components are required to install and operate the
CityTeam Guests Application.

### (2.1) INSTALL NODE.JS

Node.JS is the runtime environment for the CityTeam Guests application, which
is written in Javascript.

- Download [Node.JS](https://nodejs.org).
- Pick the latest Long Term Support (LTS) version.  [14.15.4]
- NOTE:  This will install about 3gb of Microsoft stuff required to build
  the native Node environment, so make sure you have sufficient disk space.
- Click the downloaded file to execute it.
- The instructions will recommend a Windows restart at the end, which is
  a good idea.
- Verify that this worked (after the restart):
    - Click *Windows+R* and type *cmd* to open a Command Prompt window.
    - Type *node --version* and press *Enter*.
    - You should see the installed Node version number [v14.15.4].

### (2.2) INSTALL VISUAL STUDIO CODE

Visual Studio Code is a developer-oriented text editor.  It is not required
to operate the application, but is extremely handy if the IT person doing
the installation steps needs to tweak anything.

- Download [Visual Studio Code](https://code.visualstudio.com/Download).
- Click the downloaded file to execute it.
- All of the default installation options should be fine.
- Verify that this worked:
    - You should now see *Visual Studio Code* as an available application.
    
### (2.3) INSTALL GIT

Git is a source code management tool, and will be used to retrieve the initial
download of the CityTeam Guests application, as well as any subsequent updates.

- Download [Git](https://git-scm.com/downloads).
- Pick Windows, and it should automatically select the latest version [Git-2.30.0-64-bit.exe].
- Click the downloaded file to execute it.
- All the default installation options should be fine, but changing one setting
  will make life easier:
    - For "Choosing the default editor used by Git", select "Use Visual Studio Code
      as Git's default editor".
- Verify that this worked:
    - Close any current Command Prompt window (need to pick up new path).
    - Click *Windows+R* and type *cmd* to open a Command Prompt window.
    - Type *git --version* and press *Enter*.
    - You should see the installed version number [git version 2.30.0.windows.1].

### (2.4) INSTALL CHROME

NOTE:  This step will be required on any computer where a user will be interacting
with the CityTeam Guests application.

Google Chrome is the recommended web browser to operate the CityTeam Guests Application.
The app will work (in a degraded fashion) on the default browser (Microsoft Edge),
but it has been extensively tested with Chrome.

- Download [Chrome](https://www.google.com/chrome) and click "Download Chrome".
- Click the downloaded file to execute it.
- During installation, you will be offered a couple of useful options:
    - Make Chrome your default browser.  Optional, but recommended.
    - If you have a Google account, you can log in to it to connect with
      your other Google applications.  Optional, not required by this application.
- Verify that this worked:
    - Google Chrome should have opened a new window for you.

### (2.5) INSTALL POSTMAN

Postman is a developer oriented tool that supports manually executing HTTP requests
to the *Application Server*.  It will be required during configuration, and is very
handy for debugging and other purposes later.

- Download [Postman](https://www.postman.com/downloads) and click "Download The App",
  then "Windows 64-bit" as the version.
- Click the downloaded file to execute it.
- You will be required to set up a free Postman account, which will optionally
  get you some spam mail that can be ignored.
- Verify that this worked:
  - After creating an account and signing in, you will see the "Postman"
    application window.
  - You can close this window for now, we will open one later when needed.

## (3) INSTALL CITYTEAM GUESTS APPLICATION

Applicability:  *Application Server*.

We are now ready to install the CityTeam Guests Application, and initialize it
for use.  Along the way, we will seed initial data into the database, and configure
the application as a Windows service so that it automatically starts whenever you
start (or restart) the *Application Server* system.

### (3.1) DOWNLOAD CITYTEAM GUESTS APPLICATION SOFTWARE

The software that runs this application is stored in a publicly visible
Internet hosting facility (containing literally thousands of projects from
developers all over the world) called GitHub.  We will use it to install
the initial version of the software, as well as any updates that happen later.

- If needed, press *Windows+R* and type *cmd* to open a new Command Prompt window.
- You should see that you are positioned in the home directory
  for your Windows username.  This is where the application will be installed.
- Type *git clone https://github.com/craigmcc/cityteam-guests* and press *Enter*.
- This will download the source code for this application into a *cityteam-guests*
  subdirectory inside your home directory.
- All of the subsequent operations will take place in this subdirectory,
  so type *cd cityteam-guests* and press *Enter* to move there.

### (3.2) DOWNLOAD AND BUILD APPLICATION
The source code of the application has references to all of its internal
dependencies, which we will download next.  After ensuring you are inside
the cityteam-guests subdirectory, type each of the following commands
(followed by pressing *Enter*).  The install and build steps will take a while.
Ignore any minor warnings like "SKIPPING OPTIONAL DEPENDENCY".

- *npm install*
- *npm run server:build*
- *cd client*
- *npm install*
- *npm run build*
- *cd ..*

### (3.3) CREATE GUESTS DATABASE

When we installed Postgres, we did not create the database that the
application itself will use, so let's do that now.  To do so, we will
need to decide what values to use for some "configuration variables"
that will be used several times in subsequent commands.  If you are
using a printed version of these instructions, you might find it
convenient to write in the values you have selected in the table below:

| Variable | Description | Default Value | Your Chosen Value (Blank for default)|
| -------- | ----------- | ------------- | --------------------------- |
| DB_DB | Name of the database to be created. | guests | |
| DB_HOST | Name of the computer on which Postgres was installed. | localhost | |
| DB_PASSWORD | Application password for this database. | REQUIRED - NO DEFAULT | |
| DB_USER | Application username for this database. | guests | |

Notes:
- The default DB_DB name ("guests") is appropriate in general (nobody
  but whoever sets this up cares what it is), but the "recreate" command
  
- The default DB_HOST name is appropriate when the *Application Server*
  and *Database Server* are running on the same computer.  Otherwise,
  it needs to be the network-accessible name of the *Database Server*.
- In command descriptions below, replace things like {DB_PASSWORD} with
  the actual value you have selected.
- If you have chosen default values, they do not need to be included
  in command executions.  Otherwise, add things like *--DB_USER {DB_USER}*
  (separted by spaces from other parameters) to the end of each command line,
  after the DB_PASSWORD value.

Next, we will execute a command to create the database that will be used
by the application.  This script can also be used to recreate the database
later (if needed), so it will emit some errors this time that can be ignored.

- In the Command Prompt window, type the following command:
  > node commands\database-recreate.js --DB_DB {DB_DB} --DB_PASSWORD {DB_PASSWORD}
  > 
  followed by any non-default options, and press *Enter*.
- You will be challenged for the master database password entered above.
  (You did write it down, didn't you???).
- After this operation completes, you will have a new empty database,
  named whatever you specified for the *--DB_DB* parameter (typically
  it will be "guests" but can be whatever you want).

### (3.4) GENERATE APPLICATION CONFIGURATION FILES

The CityTeam Guests application must be told what values you have selected
for the configuration values you have selected above.  This is done by creating
two files (".env.production" and ".env.development") for production and development
modes, respectively.  (The application will normally run in production mode;
development mode is strictly for development and one-time setup activities).

Make a note of any configuration variables (from above) for which you are using
non-default values.  You **must** specify the --DB_PASSWORD parameter, because there
is no default, and you must **also** specify any other parameters for which you
chose something other than the default values.

- In the Command Prompt window, type the following command:
  > node commands\environment-recreate.js --DB_PASSWORD {the password} ...{non-defaults}
  >
- This will create the two files mentioned above, complete with default values
  and a bunch of other settings that we didn't need to change.

### (3.5) RESTORE PREVIOUS BACKUP (IF ANY)

As mentioned earlier, the database we just created is empty.  If you **do**
have a previous backup file of the database content, you can reload it by
following the instructions in this step.  Otherwise, skip this step.

To restore a previous backup, you will need that backup file to be available,
and pass its name (or full path, if not in the current directory) on the command
line like this (adding the DB_HOST and/or DB_DB parameters if you chose non-default
values):

```shell
node commands\database-restore.js --FILENAME {filename}
```

This will load the previous content of the database (as of the date and time that
the backup was made), and we are good to go -- skip the next step, which is only
for the case where we do not have a backup file.

### (3.6) SEED DATABASE WITH INITIAL DATA (IF NO BACKUP AVAILABLE)

On an initial install of the application, of if there is no backup to start from,
we still need to add some initial data to make the application functional.  This can
be accomplished by starting the application in development mode and performing
a set of tasks, as described here:

- To start the server in development mode, type the following command:
  > 

[comment]: <> ( end::[]
