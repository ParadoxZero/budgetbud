setup:
	npm install

ui-build:
	npm run build

run: ui-build
	dotnet run

publish: ui
	dotnet publish -c Release -o publish

ui-run:
	npm run dev

clean:
	rm -rf dist
	rm -rf bin
	rm -rf obj
