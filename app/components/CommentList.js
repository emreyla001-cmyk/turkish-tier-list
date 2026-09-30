'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import UserBadge, { Avatar, NameTag } from './UserBadge';
import UserProfileModal from './UserProfileModal';

export default function CommentList({ comments = [], frameMap = {} }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentViewerRole, setCurrentViewerRole] = useState('user');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data?.user) {
        const { data: p } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .maybeSingle();
        if (p?.role) setCurrentViewerRole(p.role);
      }
    });
  }, []);

  if (!comments || comments.length === 0) {
    return (
      <p style={{ color: 'var(--text-dim)', fontSize: '.9rem' }}>
        Henüz yorum yapılmamış. İlk tartışmayı sen başlat!
      </p>
    );
  }

  return (
    <div className="comments-stream">
      {comments.map((c) => (
        <div className="comment msg" key={c.id}>
          <Avatar
            url={c.profiles?.avatar_url}
            name={c.profiles?.username || '?'}
            frameGradient={frameMap ? (frameMap[c.profiles?.equipped_frame] || c.profiles?.equipped_frame) : c.profiles?.equipped_frame}
            onClick={() => setSelectedUser(c.user_id)}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="msg-head">
              <span
                className="msg-name"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedUser(c.user_id)}
                title="Profili Gör / Moderatör İşlemleri"
              >
                <NameTag
                  name={c.profiles?.username || 'kullanıcı'}
                  color={c.profiles?.equipped_name_color}
                />
              </span>
              <UserBadge
                role={c.profiles?.role}
                xp={c.profiles?.xp}
                vipActive={c.profiles?.vip_until && new Date(c.profiles.vip_until) > new Date()}
              />
              <span className="msg-time">{new Date(c.created_at).toLocaleDateString('tr-TR')}</span>
            </div>
            <p className="comment-text">{c.content}</p>
          </div>
        </div>
      ))}

      {/* Kullanıcı Profili & Hızlı Moderasyon Modalı */}
      {selectedUser && (
        <UserProfileModal
          userId={selectedUser}
          onClose={() => setSelectedUser(null)}
          currentViewerRole={currentViewerRole}
        />
      )}
    </div>
  );
}
