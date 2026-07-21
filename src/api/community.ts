import type { Comment, Post } from "@/types";
import { mockComments, mockPosts } from "@/data/mockPosts";

export async function getPosts(): Promise<Post[]> {
  return mockPosts;
}

export async function getPostById(id: string): Promise<Post | undefined> {
  return mockPosts.find((p) => p.id === id);
}

export async function getCommentsByPostId(postId: string): Promise<Comment[]> {
  return mockComments.filter((c) => c.postId === postId);
}
