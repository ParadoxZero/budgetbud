ui-install:
	npm install

ui: ui-install
	npm run build

run: ui
	dotnet run

publish: ui
	dotnet publish -c Release -o publish

run-ui:
	npm run dev

clean:
	rm -rf dist
	rm -rf bin
	rm -rf obj