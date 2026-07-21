import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { ChevronLeft, Heart, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/common/Button";
import { getCommentsByPostId, getPostById } from "@/api/community";
import type { Comment, Post } from "@/types";

export default function CommunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);

  useEffect(() => {
    if (!id) return;
    let active = true;
    getPostById(id).then((p) => {
      if (active) setPost(p ?? null);
    });
    getCommentsByPostId(id).then((c) => {
      if (active) setComments(c);
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (!post) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-5 py-10 md:px-8 lg:px-[120px]">
        <p className="font-regular text-[16px] text-grey6">게시글을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-6 md:px-8 lg:px-[120px]">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-grey9"
        aria-label="뒤로 가기"
      >
        <ChevronLeft className="h-9 w-9" />
      </button>

      <article className="border-b border-grey5 pb-10">
        <h1 className="font-bold text-[24px] text-grey9">{post.title}</h1>
        <div className="mt-3 flex items-center gap-4 font-regular text-[12px] text-grey6">
          <span>{post.author}</span>
          <span>{post.createdAt}</span>
        </div>
        <p className="mt-8 font-medium text-[18px] text-grey9">{post.content}</p>
        <div className="mt-6 flex gap-2">
          {post.tags.map((t) => (
            <span
              key={t}
              className="rounded-tag bg-grey2 px-2 py-1 font-regular text-[12px] text-grey7"
            >
              {t}
            </span>
          ))}
        </div>
        <div className="mt-6 flex gap-6 font-regular text-[14px] text-grey6">
          <span className="flex items-center gap-1">
            <Heart className="h-4 w-4" aria-hidden /> {post.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-4 w-4" aria-hidden /> {post.comments}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" aria-hidden /> {post.views}
          </span>
        </div>
      </article>

      <section className="mt-10">
        <h2 className="font-bold text-[20px] text-grey9">댓글 {comments.length}</h2>
        <ul className="mt-6 flex flex-col gap-7">
          {comments.map((c) => (
            <li key={c.id} className="border-l-2 border-grey3 pl-6">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-grey4" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[14px] text-grey9">{c.author}</span>
                  <span className="font-regular text-[12px] text-grey6">{c.createdAt}</span>
                </div>
              </div>
              <p className="mt-3 font-regular text-[14px] text-grey9">{c.content}</p>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex items-center gap-4">
          <div className="h-12 w-12 shrink-0 rounded-full bg-grey4" />
          <input
            type="text"
            placeholder="댓글을 입력해주세요"
            className="flex-1 rounded-card border border-grey6 px-5 py-3 font-regular text-[14px] focus:border-grey9 focus:outline-none"
          />
          <Button>등록</Button>
        </div>
      </section>
    </div>
  );
}
