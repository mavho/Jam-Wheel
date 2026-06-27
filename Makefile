SHELL := bash
.SHELLFLAGS := -eu -o pipefail -c  
.ONESHELL:
.DELETE_ON_ERROR:

MAKEFLAGS += --warn-undefined-variables
MAKEFLAGS += --no-builtin-rules

CLIENT_DIR := music_app/
SERVER_DIR := server/

# binary location where cargo build --release runs
SERVER_BIN := $(SERVER_DIR)/target/release/music_app

.PHONY: dev dev-client dev-server \
        install install-client install-server \
        build build-client build-server \
        test test-client test-server \
        clean clean-client clean-server

## Dev
# prefix each line with server or client
dev: out/.client.packed.sentinel out/.server.packed.sentinel 
	@echo Running server and client
	@trap 'kill 0' EXIT INT TERM; \
	(cd $(SERVER_DIR) && cargo run 2>&1 | sed -e $$'s/^/\033[94m[server]\033[0m /') & \
	(cd $(CLIENT_DIR) && yarn dev 2>&1 | sed -e $$'s/^/\033[32m[client]\033[0m /') & \
	wait

dev-client: out/.client.packed.sentinel
	cd $(CLIENT_DIR) && yarn dev 2>&1 | sed -e $$'s/^/\033[32m[client]\033[0m /'


dev-server: out/.server.packed.sentinel
	cd $(SERVER_DIR) && cargo run 2>&1 | sed -e $$'s/^/\033[94m[server]\033[0m /'

out/.client.packed.sentinel: $(shell find $(CLIENT_DIR)/package.json -type f)
	@echo Reinstalling music app client packages
	mkdir -p $(@D)
	cd $(CLIENT_DIR) && yarn install && cd ..
	touch $@

# we build immediately after fetch so successive cargo run can go.
# note - on src changes `cargo run` will still recompile the binary.
out/.server.packed.sentinel: $(shell find $(SERVER_DIR)/Cargo.toml -type f)
	@echo Reinstalling music app server packages
	mkdir -p $(@D)
	cd $(SERVER_DIR) && cargo fetch && cargo build  && cd ..
	touch $@


### Build scripts for Prod

# only trigger rebuild if the installed packages are newer or a src file is newer than
# the client.dist.sentinel
out/.client.dist.sentinel: out/.client.packed.sentinel $(shell find $(CLIENT_DIR)/src -type f)
	mkdir -p $(@D)
	cd $(CLIENT_DIR) && yarn build && cd ..
	touch $@
build-client: out/.client.dist.sentinel

# only trigger rebuild if the installed packages are newer or a src file is newer than
# the compiled cargo binary
$(SERVER_BIN): out/.server.packed.sentinel $(shell find $(SERVER_DIR)/src -type f)
	cd $(SERVER_DIR) && cargo build --release
build-server: $(SERVER_BIN)

## Build for release.
build: build-client build-server

## Test
test: test-client test-server

test-client:
	cd $(CLIENT_DIR) && yarn test

test-server:
	cd $(SERVER_DIR) && cargo test

## Clean
clean: clean-client clean-server

clean-client:
	rm out/.client.*
	cd $(CLIENT_DIR) && rm -rf node_modules dist

clean-server:
	rm out/.server.*
	cd $(SERVER_DIR) && cargo clean
