Template.postEdit.events({
	'submit form': function(e){
		e.preventDefault();

		var currentPostId = this._id;

		var postProperties = {
			url: $(e.target).find('[name=url]').val(),
			title: $(e.target).find('[name=title]').val(),
			id: currentPostId 
		}

		Meteor.call('postUpdate', postProperties, function(error, result){
			// Display error and abort.
			if (error)
				return alert(error.reason);

			if(result.postExists)
				return alert('This link already exists.');

			Router.go('postPage', {_id: currentPostId});
		});
	},

	'click .delete': function(e){
		e.preventDefault();

		if(confirm("Delete this post?")){
			var currentPostId = this._id;
			Posts.remove(currentPostId);
			Router.go('postsList');
		}
	}
});