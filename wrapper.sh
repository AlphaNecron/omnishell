#!/bin/bash
LD_PRELOAD="@LAYER_SHELL_LIBDIR@/libgtk4-layer-shell.so" @MAIN_PROGRAM@ "$@"
