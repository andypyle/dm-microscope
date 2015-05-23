Posts = new Mongo.Collection('posts');

Posts.allow({
	update: function(userId, post) {
		return ownsDocument(userId, post);
	},
	remove: function(userId, post) {
		return ownsDocument(userId, post);
	}
});

Posts.deny({
	update: function(userId, post, fieldNames){
		// Can only edit these two fields:
		return (_.without(fieldNames, 'url', 'title').length > 0);
	}
});

validatePost = function(post){
	var errors = {};
	if (!post.title)
		errors.title = "Please insert a title.";
	if (!post.url)
		errors.url = "Please insert a URL.";
	return errors;
}

Meteor.methods({
	postInsert: function(postAttributes){
		check(Meteor.userId(), String);
		check(postAttributes, {
			title: String,
			url: String
		});

		var errors = validatePost(postAttributes);
		if (errors.title || errors.url)
			throw new Meteor.Error('invalid-post', "You must set a title and URL for your post.");

		var postWithSameLink = Posts.findOne({url: postAttributes.url});

		if(postWithSameLink){
			return {
				postExists: true,
				_id: postWithSameLink._id
			}
		}

		var user = Meteor.user();

		var post = _.extend(postAttributes, {
			userId: user._id,
			author: user.username,
			submitted: new Date()
		});

		var postId = Posts.insert(post);

		return {
			_id: postId
		};
	},
	postUpdate: function(postAttributes){
		var updateWithSameLink = Posts.findOne({url: postAttributes.url, _id: { $ne: postAttributes.id }});

		if(updateWithSameLink){
			return {
				postExists: true,
				_id: updateWithSameLink._id
			}
		}
	
	return Posts.update(postAttributes.id, {$set: postAttributes});
		
	}
});