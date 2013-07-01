# The shell to use for script execution
SHELL := /bin/bash

# The project's root directory
ROOT_DIR := $(shell echo ${PWD})
SNOOP := $(ROOT_DIR)/snoop/node_modules
BLOG := $(ROOT_DIR)/blog/node_modules

################# TARGETS ####################

# Forces the installation of the dependencies
install-deps-clean:
	echo installing dependencies in $(SNOOP)
	$(VERBOSE)mkdir -p $(SNOOP)
	$(VERBOSE)rm -R -f $(SNOOP)
	$(VERBOSE)mkdir $(SNOOP)
	$(VERBOSE)(cd $(SNOOP) && npm install)
	
	echo installing dependencies in $(BLOG)
	$(VERBOSE)rm -R -f $(BLOG)
	$(VERBOSE)mkdir $(BLOG)
	$(VERBOSE)(cd $(BLOG) && npm install)
	
.PHONY: install-deps-clean