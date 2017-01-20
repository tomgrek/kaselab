# KaseLab

Simple command-line time tracking, designed for freelance designers/developers.

Outputs a tab-separated time report for easy import to spreadsheet software.

# Installation

## Requirements

* node 4+
* npm 3+

No database requirements. KaseLab works with a single static file, ~/.kaselab.conf.json. Good
practice would be to back this up regularly.

## Installing

```
npm install -g kaselab
```

# Usage
```
-> % kaselab new project BestWebApp
Any project reference? [no] myClient-002
Any client? [no] myClient
Does client have its own reference? [no]
Successfully created BestWebApp and set it as the active project

-> % kaselab use myClient-001
Successfully set active project to myClient-001

-> % kaselab timer start
Started timer on myClient-001

-> % kaselab timer stop
Description of what you did: [working] Created app framework
Stopped timer on myClient-001

-> % kaselab report myClient-001
Time report for project myClient-001
---------------------
Project initiated: Tue Jan 17 2017
Total time: 12 hrs 1 mins over 1 days.
---------------------
Date			Start	End	Description
Wed Jan 18 2017		08:46	15:46	Wireframing
Thu Jan 19 2017		14:13	19:15	Created app framework

```

## What about broken time?

Sometimes I forget to start or stop a timer. In this case, you can just edit ~/.kaselab.conf.json and correct
the mistakes.

# License

This is public domain.

# Contributions

Are welcome.
