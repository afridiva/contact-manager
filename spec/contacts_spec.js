var request = require("request");
var url = "https://jusibe.com/smsapi/send_sms/"

describe('Contacts Manager', function(){

	// Check if add function returns 200
	it('returns status code 200', function(){
		request.get(url, function(error, response, body) {
        	expect(response.statusCode).toBe(200);
      	});
	});
	it('should have listNotes property', function(){
		expect(notesApplication.hasOwnProperty('listNotes')).toBe(true);
	});
	it('should have get property', function(){
		expect(notesApplication.hasOwnProperty('get')).toBe(true);
	});
	it('should have search property', function(){
		expect(notesApplication.hasOwnProperty('search')).toBe(true);
	});
	it('should have delete property', function(){
		expect(notesApplication.hasOwnProperty('delete')).toBe(true);
	});
	it('should have edit property', function(){
		expect(notesApplication.hasOwnProperty('edit')).toBe(true);
	});

	// Check if properties are functions
	it('should have create property', function(){
		expect(typeof notesApplication.create).toBe(typeof (function(){}));
	});
	it('should have listNotes property', function(){
		expect(typeof notesApplication.listNotes).toBe(typeof (function(){}));
	});
	it('should have get property', function(){
		expect(typeof notesApplication.get).toBe(typeof (function(){}));
	});
	it('should have search property', function(){
		expect(typeof notesApplication.delete).toBe(typeof (function(){}));
	});
	it('should have delete property', function(){
		expect(typeof notesApplication.edit).toBe(typeof (function(){}));
	});
	it('should have edit property', function(){
		expect(typeof notesApplication.search).toBe(typeof (function(){}));
	});

	// check if functions return correct output
	it('should give an error message on create with empty note content', function(){
		expect(notesApplication.create()).toBe("Note was not created because note content is empty");
		expect(notesApplication.create('')).toBe("Note was not created because note content is empty");
	});

	it('should give an error message on edit with invalid note_id', function(){
		// Check if note_id exists
		expect(notesApplication.edit(1)).toMatch(/^Note not found for/);
		expect(notesApplication.edit(0, '')).toMatch(/^Note not found for/);
	});

	it('should give an error message on edit with empty note content', function(){
		// Check if new content is undefined
		notesApplication.create('This is a new note');
		expect(notesApplication.edit(0)).toBe("Note was not edited because note content is empty");
		expect(notesApplication.edit(0, '')).toBe("Note was not edited because note content is empty");
	});

	it('should give an error message on get invalid note_id', function(){
		notesApplication.create();
		// For get operation
		expect(notesApplication.get()).toBe("No note id included");

		// For edit operation
		expect(notesApplication.edit()).toBe("No note id included");
		
		// For delete operation
		expect(notesApplication.delete()).toBe("No note id included");
	});

	it('should give an error message on non_existent note_id', function(){
		// For get operation
		expect(notesApplication.get(1)).toMatch(/^Note not found for/);

		// For delete operation
		expect(notesApplication.delete(1)).toMatch(/^Note not found for/);
	});

	it('should return search results', function(){
		expect(notesApplication.search()).toBe("Showing all results<br><br>" + notesApplication.listNotes());
		expect(notesApplication.search('')).toBe("Showing all results<br><br>" + notesApplication.listNotes());
		expect(notesApplication.search('note')).toMatch(/^Showing results for/);
	});

	it('should return feedback', function(){
		expect(typeof notesApplication.listNotes()).toBe(typeof "a");
		expect(typeof notesApplication.create()).toBe(typeof "a");
		expect(typeof notesApplication.edit()).toBe(typeof "a");
		expect(typeof notesApplication.delete()).toBe(typeof "a");
		expect(typeof notesApplication.get()).toBe(typeof "a");
		expect(typeof notesApplication.search()).toBe(typeof "a");
	});

	it('should return note content on get function', function(){
		expect(notesApplication.get(0)).toBe(notesApplication.notes[0]);
	});

	//Test additional functions added
	it('should return true if valid', function(){
		// validateId function
		expect(notesApplication.validateId(0)).toBeTruthy();
	});

	it('should return no note included if note id is undefined', function(){
		// validateId function
		expect(notesApplication.validateId()).toBe("No note id included");
	});

	it('should return formatted string', function(){
		// formatNote function
		expect(typeof notesApplication.formatNote(0)).toBe(typeof "a");
		expect(notesApplication.formatNote(0)).toMatch(/^Note ID:/);
	});

	it('should return nothing if note id is undefined', function(){
		// formatNote function
		expect(notesApplication.formatNote()).toBeUndefined();
	});
});