# ui
UI es un toolkit basado en el framework [AngularJS](https://angularjs.org/) y [Bootstrap](http://getbootstrap.com/) que ofrece un conjunto
de componentes reutilizables.

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Prerrequisitos
Este proyecto depende de:
- [node](https://nodejs.org/en/)
- [gulp](http://gulpjs.com/)
- [bower](https://bower.io/)

Se recomienda usar [nvm](https://github.com/creationix/nvm) para instalar node en la versión 6.9.4 LTS
```
$ nvm install 6.9.4
$ nvm use 6.9.4
$ nvm alias default 6.9.4
```

## Contribuir
Para poder colaborar en el proyecto, se deben instalar los prerrequisitos mencionados anteriormente. Además, instalar las dependencias del proyecto haciendo lo siguiente:
```
$ npm install
$ bower install
```

#### Generar nueva version del proyecto
Para generar una nueva version del proyecto:

* Actualizar la version en el archivo bower.json
* Ejecutar el siguiente comando en el directorio root del proyecto

```
$ gulp build
```

* Pushear los cambios al repositorio

## Proyecto de ejemplo
Para poder ver el proyecto de ejemplo que se encuentra disponible, simplemente hacer lo siguiente (en el root del repositorio):

```
$ python -m SimpleHTTPServer 8000
```

Luego ir al siguiente enlace [http://localhost:8000/sample](http://localhost:8000/sample)
