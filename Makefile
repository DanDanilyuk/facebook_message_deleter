.PHONY: min clean

min: delete_messages_min.js

delete_messages_min.js: delete_messages.js
	npx -y terser delete_messages.js -c -m -o delete_messages_min.js

clean:
	rm -f delete_messages_min.js
