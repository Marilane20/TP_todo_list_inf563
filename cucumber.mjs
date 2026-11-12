export default {
  paths: ['features/**/*.feature'],
  import: ['features/step_definitions/**/*.ts'],
  nodeOptions: ['--import', 'tsx']
}