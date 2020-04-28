const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator'); // String validation library https://github.com/validatorjs/validator.js
// const User = require('./userModel');

//dataschema https://mongoosejs.com/docs/guide.html#definition
const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a price'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must have maximum of 40 characters'], // Backend validators
      minlength: [10, 'A tour name must have at least 10 characters']
      //validate: [validator.isAlpha, 'Tour name must only contain characters'] // validator.js validation
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a grpoup size']
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'], // Enum is a backend data validator for strings
        message: 'Difficulty must be either easy, medium, difficult'
      }
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must not be above 5.0']
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        // custom data validator that we wrote ourself
        validator: function(val) {
          // this only points to curent doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) cannot be greater than price!' //({allows access to the value itself})
      }
    },
    summary: {
      type: String,
      trim: true,
      required: ['A tour must have a descvription']
    },
    description: {
      type: String,
      trim: true
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false
    },
    startLocation: {
      // GeoJSON
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
      }
    ],
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
// GeoJson support and location data added to tourModel

// Virtual properties wont be saved into database
// Using a regular function instead of arrow functions as arrows dont get its own this keyword
// virtual properties can't be queried in a url
tourSchema.virtual('durationWeeks').get(function() {
  return this.duration / 7;
});

// Document middleware: runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Retrieve user documents corresponding to id's
// tourSchema.pre('save', async function(next) {
//   const guidesPromises = this.guides.map(async id => User.findById(id));
//   this.guides = await Promise.all(guidesPromises);

//   next();
// });

// tourSchema.pre('save', function(next) {
//   console.log('Will save document..');
//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE that runs before find method to exclude secret tour from results
tourSchema.pre(/^find/, function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

tourSchema.post(/^find/, function(docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  //console.log(docs);
  next();
});

// Populate the tour with gudes
tourSchema.pre(/^find/, function(next) {
  this.populate({
    //poulate function is fundamental when working with mongoose
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });
  next();
});

// AGGREGATION MIDDLEWARE
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

//datamodel https://mongoosejs.com/docs/models.html
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
