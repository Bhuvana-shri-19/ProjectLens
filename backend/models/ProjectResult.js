const mongoose = require('mongoose');

const projectResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    githubUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },
    repositoryOwner: {
      type: String,
      trim: true,
      default: '',
    },
    repositoryName: {
      type: String,
      trim: true,
      default: '',
    },
    repoInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    evaluation: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
  },
  {
    timestamps: true,
    minimize: false,
  }
);

projectResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ProjectResult', projectResultSchema);
