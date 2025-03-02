project(
  'omnishell',
  default_options: [
    'prefix=~/.local'
  ]
)

pkgdatadir = get_option('prefix') / meson.project_name()
main = meson.project_name() + '.wrapped'

custom_target(
  command: [
    find_program('ags'),
    'bundle',
    '--root', meson.project_source_root(),
    meson.project_source_root() / 'app.ts',
    main,
  ],
  output: main,
  input: files('app.ts'),
  install: true,
  build_always_stale: true,
  install_dir: pkgdatadir
)

configure_file(
  input: files('wrapper.sh'),
  output: meson.project_name(),
  configuration: {
    'MAIN_PROGRAM': pkgdatadir / main,
    'LAYER_SHELL_LIBDIR': dependency('gtk4-layer-shell-0').get_variable('libdir'),
  },
  install: true,
  install_dir: get_option('prefix') / get_option('bindir'),
  install_mode: 'rwxr-xr-x'
)