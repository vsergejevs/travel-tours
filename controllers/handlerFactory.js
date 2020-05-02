const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Generalization of the delete function to delete either a review, or a tour

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }

    res.status(204).json({
      status: 'success',
      data: null
    });
  });
