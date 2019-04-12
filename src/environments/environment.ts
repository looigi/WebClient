// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.test_scenario`, but if you do
// `ng build --env=prod` then `environment.prod.test_scenario` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  replaceChar: '_',
  // urlBase: 'http://10.100.7.153:9999/api/v1',
  // urlRoot: 'http://10.100.7.153:9999/',
  urlBase: 'http://10.100.7.29:2828/api/v1',
  urlRoot: 'http://10.100.7.29:2828/',
  clientTypeVersion: 'Debug'
};
