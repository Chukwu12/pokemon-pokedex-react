import React, { useEffect, useState } from 'react';
import { fetchEvolutionChain } from '../services/getPokemon';

// Helper to recursively extract evolution chain
function extractChain(chain) {
  const evo = [];
  let current = chain;
  while (current) {
    // Extract the Pokémon ID from the species URL
    let id = null;
    if (current.species.url) {
      const match = current.species.url.match(/\/pokemon-species\/(\d+)\/?$/);
      if (match) id = match[1];
    }
    evo.push({
      name: current.species.name,
      url: current.species.url,
      id,
      evolves_to: current.evolves_to,
      details: current.evolution_details || [],
    });
    if (current.evolves_to && current.evolves_to.length > 0) {
      current = current.evolves_to[0];
    } else {
      current = null;
    }
  }
  return evo;
}

export default function EvolutionChain({ chainId, currentPokemon, onStageClick }) {
  const [chain, setChain] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!chainId) return;
    setLoading(true);
    fetchEvolutionChain(chainId)
      .then((data) => {
        if (data && data.chain) {
          setChain(extractChain(data.chain));
        } else {
          setChain([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load evolution chain');
        setLoading(false);
      });
  }, [chainId]);

  if (loading) return <div>Loading evolution chain...</div>;
  if (error) return <div>{error}</div>;
  if (!chain.length) return <div>No evolution data.</div>;

  return (
    <div className="evolution-chain">
      <h3>Evolution Chain</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {chain.map((stage, idx) => (
          <React.Fragment key={stage.name}>
            <div
              style={{
                padding: 8,
                borderRadius: 8,
                background: stage.name === currentPokemon ? '#ffe066' : '#f0f0f0',
                border: stage.name === currentPokemon ? '3px solid #ffa600' : '1px solid #ccc',
                textAlign: 'center',
                minWidth: 100,
                cursor: onStageClick ? 'pointer' : 'default',
                boxShadow:
                  stage.name === currentPokemon
                    ? '0 0 12px 2px #ffe066, 0 2px 8px rgba(0,0,0,0.07)'
                    : onStageClick
                    ? '0 2px 8px rgba(0,0,0,0.07)'
                    : undefined,
                fontWeight: stage.name === currentPokemon ? 'bold' : undefined,
              }}
              onClick={onStageClick ? () => onStageClick(stage.name) : undefined}
              title={onStageClick ? `View ${stage.name}` : undefined}
            >
              <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{stage.name}</div>
              {stage.id && (
                <img
                  src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${stage.id}.png`}
                  alt={stage.name}
                  style={{ width: 56, height: 56, margin: '4px 0' }}
                />
              )}
              {stage.details.length > 0 && (
                <div style={{ fontSize: 12, marginTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {stage.details.map((d, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      {/* Trigger icon/badge */}
                      {d.trigger && d.trigger.name && (
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          background: '#e0e7ff',
                          color: '#3730a3',
                          borderRadius: 8,
                          padding: '2px 8px',
                          fontWeight: 500,
                          fontSize: 12,
                          marginRight: 4,
                        }}>
                          {d.trigger.name === 'level-up' && <span title="Level Up" style={{marginRight: 2}}>⬆️</span>}
                          {d.trigger.name === 'use-item' && <span title="Use Item" style={{marginRight: 2}}>🧪</span>}
                          {d.trigger.name === 'trade' && <span title="Trade" style={{marginRight: 2}}>🔄</span>}
                          {d.trigger.name === 'shed' && <span title="Shed" style={{marginRight: 2}}>🪶</span>}
                          {d.trigger.name === 'other' && <span title="Other" style={{marginRight: 2}}>❓</span>}
                          {d.trigger.name.replace(/-/g, ' ')}
                        </span>
                      )}
                      {/* Level badge */}
                      {d.min_level && (
                        <span style={{
                          background: '#fef9c3',
                          color: '#854d0e',
                          borderRadius: 8,
                          padding: '2px 8px',
                          fontWeight: 500,
                          fontSize: 12,
                        }}>
                          Lv. {d.min_level}
                        </span>
                      )}
                      {/* Add more trigger details as needed */}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {idx < chain.length - 1 && <span style={{ fontSize: 24 }}>→</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
