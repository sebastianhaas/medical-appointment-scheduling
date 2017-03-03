# Medical Appointment Scheduling

[![Join the chat at https://gitter.im/medical-appointment-scheduling/Lobby](https://badges.gitter.im/medical-appointment-scheduling/Lobby.svg)](https://gitter.im/medical-appointment-scheduling/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
Concept showcase for "Design of a Web-Based Appointment Scheduling System for Small and Medium-Sized Medical Facilities".

## Showcase
A snapshot of this repository is available on [Heroku](https://scheduling-client.herokuapp.com).

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

## License
[MIT](/LICENSE)
