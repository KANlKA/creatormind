import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IVideo extends Document {
  userId: mongoose.Types.ObjectId;
  videoId: string;
  title: string;
  description: string;
  publishedAt: Date;
  duration: string;
  
  // Stats
  views: number;
  likes: number;
  commentCount: number;
  
  // Computed metrics
  engagementRate: number;
  viewVelocity: number;
  
  // AI Analysis
  analysis: {
    topic: string;
    subtopics: string[];
    tone: string;
    hookType: string;
    audienceIntent: string;
    complexity: string;
    format: string;
    structure: string;
    visualStyle?: string;
  };
  
  // Content
  transcript?: string;
  thumbnailUrl: string;
  
  analyzedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema = new Schema<IVideo>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    videoId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: String,
    publishedAt: { type: Date, required: true },
    duration: String,
    
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    
    engagementRate: { type: Number, default: 0 },
    viewVelocity: { type: Number, default: 0 },
    
    analysis: {
      topic: String,
      subtopics: [String],
      tone: String,
      hookType: String,
      audienceIntent: String,
      complexity: String,
      format: String,
      structure: String,
      visualStyle: String,
    },
    
    transcript: String,
    thumbnailUrl: String,
    
    analyzedAt: Date,
  },
  { timestamps: true }
);

// Indexes
VideoSchema.index({ userId: 1, publishedAt: -1 });
// videoId already has unique: true, no need for additional index
VideoSchema.index({ userId: 1, engagementRate: -1 });

const Video: Model<IVideo> = mongoose.models.Video || mongoose.model<IVideo>('Video', VideoSchema);

export default Video;