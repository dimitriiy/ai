.PHONY: api web worker all install typecheck clean

ROOT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))

api:
	cd $(ROOT_DIR) && yarn dev:api

worker:
	cd $(ROOT_DIR) && yarn dev:worker

web:
	cd $(ROOT_DIR)web && yarn dev

all:
	@echo "Starting API + Worker + Web concurrently..."
	@trap 'kill 0' EXIT; \
	$(MAKE) --no-print-directory api & \
	$(MAKE) --no-print-directory worker & \
	$(MAKE) --no-print-directory web & \
	wait

install:
	cd $(ROOT_DIR) && yarn install
	cd $(ROOT_DIR)web && yarn install

typecheck:
	cd $(ROOT_DIR) && yarn typecheck
	cd $(ROOT_DIR)web && yarn typecheck

clean:
	rm -rf $(ROOT_DIR)node_modules $(ROOT_DIR)web/node_modules
