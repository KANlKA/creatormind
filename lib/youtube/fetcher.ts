import youtube, { getYouTubeClient } from './client';
import { youtube_v3 } from 'googleapis';

export interface VideoData {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnailUrl: string;
  duration: string;
  views: number;
  likes: number;
  commentCount: number;
}

export interface CommentData {
  commentId: string;
  authorName: string;
  text: string;
  likes: number;
  publishedAt: string;
}

/**
 * Fetch all videos from a channel
 */
export async function fetchAllVideos(channelId: string, accessToken: string): Promise<VideoData[]> {
  const client = getYouTubeClient(accessToken);
  const videos: VideoData[] = [];
  let pageToken: string | undefined;
  
  try {
    do {
      const response = await client.search.list({
        part: ['id', 'snippet'],
        channelId,
        maxResults: 50,
        order: 'date',
        type: ['video'],
        pageToken,
      });
      
      const videoIds = response.data.items?.map(item => item.id?.videoId).filter(Boolean) as string[];
      
      if (videoIds.length > 0) {
        // Fetch detailed stats for these videos
        const detailsResponse = await client.videos.list({
          part: ['snippet', 'statistics', 'contentDetails'],
          id: videoIds,
        });
        
        detailsResponse.data.items?.forEach(video => {
          if (video.id) {
            videos.push({
              videoId: video.id,
              title: video.snippet?.title || '',
              description: video.snippet?.description || '',
              publishedAt: video.snippet?.publishedAt || '',
              thumbnailUrl: video.snippet?.thumbnails?.high?.url || '',
              duration: video.contentDetails?.duration || '',
              views: parseInt(video.statistics?.viewCount || '0'),
              likes: parseInt(video.statistics?.likeCount || '0'),
              commentCount: parseInt(video.statistics?.commentCount || '0'),
            });
          }
        });
      }
      
      pageToken = response.data.nextPageToken || undefined;
      
      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } while (pageToken);
    
    return videos;
    
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
}

/**
 * Fetch all comments for a video (or up to maxResults if specified)
 */
export async function fetchVideoComments(
  videoId: string,
  maxResults: number = Infinity,
  accessToken: string
): Promise<CommentData[]> {
  const client = getYouTubeClient(accessToken);
  const comments: CommentData[] = [];
  let pageToken: string | undefined;

  try {
    do {
      const remaining = maxResults === Infinity ? 100 : Math.min(100, maxResults - comments.length);

      const response = await client.commentThreads.list({
        part: ['snippet'],
        videoId,
        maxResults: remaining,
        order: 'relevance',
        textFormat: 'plainText',
        pageToken,
      });

      response.data.items?.forEach(item => {
        const comment = item.snippet?.topLevelComment?.snippet;
        if (comment) {
          comments.push({
            commentId: item.id || '',
            authorName: comment.authorDisplayName || '',
            text: comment.textDisplay || '',
            likes: comment.likeCount || 0,
            publishedAt: comment.publishedAt || '',
          });
        }
      });

      pageToken = response.data.nextPageToken || undefined;

      if (maxResults !== Infinity && comments.length >= maxResults) break;

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } while (pageToken);

    return maxResults === Infinity ? comments : comments.slice(0, maxResults);

  } catch (error) {
    console.error(`Error fetching comments for video ${videoId}:`, error);
    return []; // Return empty array if comments are disabled
  }
}

/**
 * Fetch channel metadata
 */
export async function fetchChannelData(channelId: string, accessToken: string) {
  const client = getYouTubeClient(accessToken);
  
  try {
    const response = await client.channels.list({
      part: ['snippet', 'statistics'],
      id: [channelId],
    });
    
    const channel = response.data.items?.[0];
    
    if (!channel) {
      throw new Error('Channel not found');
    }
    
    return {
      channelId: channel.id || '',
      channelName: channel.snippet?.title || '',
      subscriberCount: parseInt(channel.statistics?.subscriberCount || '0'),
      thumbnailUrl: channel.snippet?.thumbnails?.default?.url || '',
    };
    
  } catch (error) {
    console.error('Error fetching channel data:', error);
    throw error;
  }
}