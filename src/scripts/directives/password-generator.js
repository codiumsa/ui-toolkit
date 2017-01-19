(function() {
  'use strict';

  /**
   * Directiva que genera un campo "Generador de contraseñas" 
   */
  angular.module('ui')
    .component('passwordGenerator', {
      templateUrl: 'views/password-generator.html',
      selector: 'passwordGenerator',
      bindings: {
        /**
         * Handler a llamar cuando se genera una contraseña. Recibe como parámetro
         * el password generado.
         */
        afterGenerate: '&'
      },
      controller: PasswordGeneratorCtrl,
      controllerAs: 'vm'
    });

  // lista de caracteres extraído de 
  // https://github.com/rkammer/AngularJS-Password-Generator/blob/master/js/application.js
  const lowerCharacters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  const upperCharacters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
  const numbers = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const symbols = ['!', '"', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~'];


  PasswordGeneratorCtrl.$inject = ['$timeout'];

  function PasswordGeneratorCtrl($timeout) {
    this.$timeout = $timeout;
    this.passwordLength = 10;
    this.generate = generate.bind(this);
    this.onSuccess = onSuccess.bind(this);
    this.showTooltip = showTooltip.bind(this);

    this.$onDestroy = () => {
      if (this.clipboardObj) {
        this.clipboardObj.destroy();
      }
    };
  }

  function generate() {
    let buffer = lowerCharacters;
    buffer = buffer.concat(this.includeCapitalLetters ? upperCharacters : [])
      .concat(this.includeNumbers ? numbers : [])
      .concat(this.includeSymbols ? symbols : []);
    const len = this.passwordLength;
    let password = '';

    do {
      password += buffer[Math.floor(Math.random() * buffer.length)];
    } while (password.length < len);
    this.model = password;

    if (angular.isFunction(this.afterGenerate)) {
      this.afterGenerate({ password });
    }
  }


  function onSuccess(event) {
    event.clearSelection();
    this.showTooltip(event.trigger, 'Copiado!');
  }

  function showTooltip(elem, msg) {
    const classes = elem.className;
    elem.setAttribute('class', classes + ' btn tooltipped tooltipped-s');
    elem.setAttribute('aria-label', msg);
    this.$timeout(() => {
      elem.setAttribute('class', classes);
    }, 1000);
  }
}());