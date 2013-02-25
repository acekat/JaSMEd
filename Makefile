JS = $(wildcard client/*/*.js)
JSON = $(wildcard client/*/*.json)
JADE = $(wildcard client/**/*.jade)

all: link

link: build
	cp build/build.js public/javascripts/jasmed.js

build: components $(JS) $(JADE)
	component build --use jade-builder

components: $(JSON)
	component install

clean:
	rm -fr build

distclean: clean
	rm -fr components

.PHONY: clean distclean
