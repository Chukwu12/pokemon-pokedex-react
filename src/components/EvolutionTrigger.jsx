import React, { useEffect, useState } from 'react';
import { fetchEvolutionTrigger } from '../services/getPokemon';

export default function EvolutionTrigger({ triggerIdOrName }) {
  const [trigger, setTrigger] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!triggerIdOrName) return;
    setLoading(true);
    fetchEvolutionTrigger(triggerIdOrName)
      .then((data) => {
        setTrigger(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load evolution trigger');
        setLoading(false);
      });
  }, [triggerIdOrName]);

  if (loading) return <div>Loading evolution trigger...</div>;
  if (error) return <div>{error}</div>;
  if (!trigger) return <div>No trigger data.</div>;

  return (
    <div className="evolution-trigger">
      <h4>Evolution Trigger: {trigger.name}</h4>
      <ul>
        {trigger.pokemon_species.map((species) => (
          <li key={species.name}>{species.name}</li>
        ))}
      </ul>
    </div>
  );
}
