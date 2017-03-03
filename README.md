# Medical Appointment Scheduling

[![Greenkeeper badge](https://badges.greenkeeper.io/sebastianhaas/medical-appointment-scheduling.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/sebastianhaas/medical-appointment-scheduling.svg?branch=master)](https://travis-ci.org/sebastianhaas/medical-appointment-scheduling)
[![Dependency Status](https://david-dm.org/sebastianhaas/medical-appointment-scheduling.svg)](https://david-dm.org/sebastianhaas/medical-appointment-scheduling)
[![Join the chat at https://gitter.im/sebastianhaas/medical-appointment-scheduling](https://badges.gitter.im/sebastianhaas/medical-appointment-scheduling.svg)](https://gitter.im/sebastianhaas/medical-appointment-scheduling?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Concept showcase for "Design of a Web-Based Appointment Scheduling System for Small and Medium-Sized Medical Facilities".

## Live showcase
An up-to-date snapshot of this repository is always available on [Heroku](https://scheduling-client.herokuapp.com).
> Due to the limitations of Heroku's free dynos and database service, it might take a while for the application to load initially. Also, there is a 10k row limit for free databases. Sometimes you might have to wipe test data other users created before being able to add new content. Test data can be inserted and deleted using the app-bar menu in the upper right corner.

## How to deploy
This application can be easily deployed to Heroku. tbd

## How to run locally
After checkout, run:
```
$ npm install
$ npm start
```
This requires node >=4 together with npm to be installed. This repository doesn't contain any backend, you need to have an instance of [medical-appointment-scheduling-server](https://github.com/sebastianhaas/medical-appointment-scheduling-server) running.

## Tests
Both unit and end-to-end tests do exist for most parts of the application.

### Unit tests
```
$ npm run test
```

### End-to-end tests
Make sure you have a running instance in another terminal before running end-to-end tests.
```
$ npm run e2e
```

## Technology stack
### Core technologies
* [Angular 2](https://angular.io/)
* [Angular Material](https://material.angular.io/)
* [SASS](http://sass-lang.com/)

### Bundling and packaging
* [webpack](https://webpack.github.io/)
* [npm](http://npmjs.com/)

### Testing
* [Karma](https://karma-runner.github.io/1.0/index.html)
* [Jasmine](http://jasmine.github.io/)
* [Protractor](http://www.protractortest.org/)
* [Selenium](http://docs.seleniumhq.org/)

### Other development tools
* [tslint](https://github.com/palantir/tslint/)
* [Typedoc](https://github.com/TypeStrong/typedoc)

## License
[MIT](/LICENSE)
