'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import AdminGuard from '../../../components/AdminGuard';
import CharacterForm from '../../../components/CharacterForm';

export default function EditCharacterPage({ params }) {
  const [character, setCharacter] = useState(null);

  useEffect(() => {
    supabase.from('characters').select('*').eq('id', params.id).single()
      .then(({ data }) => setCharacter(data));
  }, [params.id]);

  return (
    <AdminGuard>
      <div className="wrap">
        <h1>Karakteri Düzenle</h1>
        {character && (
          <CharacterForm
            characterId={params.id}
            initial={{
              name: character.name || '', series: character.series || '', category: character.category || '',
              tier: character.tier || '',
              power_score: character.power_score ?? '', intelligence_score: character.intelligence_score ?? '',
              speed_score: character.speed_score ?? '', durability_score: character.durability_score ?? '',
              influence_score: character.influence_score ?? '',
              description: character.description || '', image_url: character.image_url || '', video_url: character.video_url || '',
              status: character.status || 'draft',
            }}
          />
        )}
      </div>
    </AdminGuard>
  );
}
