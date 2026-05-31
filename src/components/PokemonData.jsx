import React from 'react';
import EvolutionChain from './EvolutionChain';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';

const TYPE_COLORS = {
  normal: { main: '#94a3b8', soft: '#e2e8f0', text: '#334155' },
  fire: { main: '#f97316', soft: '#ffedd5', text: '#9a3412' },
  water: { main: '#3b82f6', soft: '#dbeafe', text: '#1d4ed8' },
  electric: { main: '#facc15', soft: '#fef9c3', text: '#854d0e' },
  grass: { main: '#22c55e', soft: '#dcfce7', text: '#166534' },
  ice: { main: '#06b6d4', soft: '#cffafe', text: '#155e75' },
  fighting: { main: '#dc2626', soft: '#fee2e2', text: '#991b1b' },
  poison: { main: '#a855f7', soft: '#f3e8ff', text: '#6b21a8' },
  ground: { main: '#b45309', soft: '#fef3c7', text: '#78350f' },
  flying: { main: '#6366f1', soft: '#e0e7ff', text: '#3730a3' },
  psychic: { main: '#ec4899', soft: '#fce7f3', text: '#9d174d' },
  bug: { main: '#65a30d', soft: '#ecfccb', text: '#3f6212' },
  rock: { main: '#78716c', soft: '#f5f5f4', text: '#44403c' },
  ghost: { main: '#7c3aed', soft: '#ede9fe', text: '#5b21b6' },
  dragon: { main: '#2563eb', soft: '#dbeafe', text: '#1e3a8a' },
  dark: { main: '#334155', soft: '#e2e8f0', text: '#0f172a' },
  steel: { main: '#64748b', soft: '#e2e8f0', text: '#334155' },
  fairy: { main: '#f472b6', soft: '#fce7f3', text: '#9d174d' },
};

function formatLabel(label) {
  return label
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getTypeColors(typeName) {
  return TYPE_COLORS[typeName] || TYPE_COLORS.normal;
}

export default function PokemonData(props) {
  const primaryType = props.primaryType || props.types?.[0]?.type?.name || 'normal';
  const primaryColors = getTypeColors(primaryType);

  return (
    <Container
      className="pokemon-panel mt-3 animate-in"
      style={{
        '--type-main': primaryColors.main,
        '--type-soft': primaryColors.soft,
        '--type-text': primaryColors.text,
      }}
    >
      <Row className="g-3">
        <Col xs={12} md={6}>
          <Card className="data-card card-left">
            <Card.Header className="data-card-header">
              <div className="pokemon-title-wrap">
                <h3>{formatLabel(props.name)}</h3>
                {props.showReleaseStatus ? (
                  <span
                    className={`go-status-pill ${props.isReleasedInGo ? 'go-status-pill-live' : 'go-status-pill-upcoming'}`}
                  >
                    {props.isReleasedInGo ? 'Released in Pokemon GO' : 'Not Released in Pokemon GO'}
                  </span>
                ) : null}
              </div>
              <img className="pokemon-sprite" src={props.sprite} alt={props.name} />
            </Card.Header>
            <Card.Body>
              <h5 className="section-heading">Abilities</h5>
              {props.abilities.map((ability, key) => (
                <div className="chip-row" key={key}>
                  <span className="info-chip">{formatLabel(ability.ability.name)}</span>
                </div>
              ))}

              <h5 className="section-heading mt-3">Types</h5>
              {props.types.map((type, key) => (
                <div className="chip-row" key={key}>
                  <span
                    className="type-pill"
                    style={{
                      background: getTypeColors(type.type.name).soft,
                      color: getTypeColors(type.type.name).text,
                    }}
                  >
                    {formatLabel(type.type.name)}
                  </span>
                </div>
              ))}

              {/* Evolution Chain Section */}
              {props.evolutionChainId && (
                <div className="mt-4">
                  <EvolutionChain
                    chainId={props.evolutionChainId}
                    currentPokemon={props.name.toLowerCase()}
                    onStageClick={props.onEvolutionStageClick}
                  />
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} md={6}>
          <Card className="data-card card-right">
            <Card.Body>
              <h4 className="section-heading">Base Stats</h4>
              {props.stats.map((stat, key) => (
                <div className="stat-block" key={key}>
                  <div className="stat-line">
                    <strong>{formatLabel(stat.stat.name)}</strong>
                    <span>{stat.base_stat}</span>
                  </div>
                  <ProgressBar
                    now={stat.base_stat}
                    max={255}
                    variant="success"
                  />
                </div>
              ))}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}