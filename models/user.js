var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;

var userSchema = new Schema({
	local: {
		name: { type: String },
		email: { type: String },
		password: { type: String }
	},
	facebook: {
		id: String,
		token: String,
		email: String,
		name: String
	},
	google           : {
		id           : String,
		token        : String,
		email        : String,
		name         : String },

	profile_photo: { type: Schema.Types.ObjectId, ref: 'Photo' },
	sex: { type: String, enum: ['Male', 'Female']},
	birth: { type: Date, default: new Date() },
	phone: { type: String, default: "010-1234-5678" },

	additionalInfo	: { 
		like_genres				: [{ type: String }],
		like_regions			:	[{ type: Schema.Types.ObjectId, ref: 'Region' }],
		wellknown_regions :	[{ type: Schema.Types.ObjectId, ref: 'Region' }],
		visited_regions		: [{ type: Schema.Types.ObjectId, ref: 'Region' }]
 },

}, {
	toObject: {
		virtuals: true,
		getters: true
	},
	toJSON: {
		virtuals: true
	}
});

userSchema.methods.generateHash = function(password) {
	    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
 return bcrypt.compareSync(password, this.local.password);
};

userSchema.methods.getBlogUrlCandidate = function() {
	if (this.local) { return this.local.email.split("@")[0]; }
	if (this.facebook) { return this.facebook.email.split("@")[0]; }
};

userSchema.statics.isValidName = function(name) {
	var pattern = /^[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
	return name.length > 1 && !pattern.test(name);
};

userSchema.virtual('name').get(function() {
	return userSchema.statics.getName(this);
});

userSchema.virtual('email').get(function() {
	return userSchema.statics.getEmail(this);
});

userSchema.statics.getName = function(user) {
	//if (user.toObject) user = user.toObject();
	if (!_.isEmpty(user.local) && user.local.name && user.local.name.length > 0) return user.local.name;
	if (!_.isEmpty(user.facebook) && user.facebook.name && user.facebook.name.length > 0) return user.facebook.name;
	if (!_.isEmpty(user.google) && user.google.name && user.google.name.length > 0) return user.google.name;
};

userSchema.statics.getEmail = function(user) {
	if (!_.isEmpty(user.local) && user.local.name && user.local.email.length > 0) return user.local.email;
	if (!_.isEmpty(user.facebook) && user.facebook.name && user.facebook.email.length > 0) return user.facebook.email;
	if (!_.isEmpty(user.google) && user.google.name && user.google.email.length > 0) return user.google.email;
};


// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
