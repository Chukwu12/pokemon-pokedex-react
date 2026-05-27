import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';

const ALL_TYPES = [
  'bug',
  'dark',
  'dragon',
  'electric',
  'fairy',
  'fighting',
  'fire',
  'flying',
  'ghost',
  'grass',
  'ground',
  'ice',
  'normal',
  'poison',
  'psychic',
  'rock',
  'steel',
  'water',
];

function formatLabel(label) {
  return label
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getStatValue(stats, statName) {
  const match = stats.find((stat) => stat.stat.name === statName);
  return match ? match.base_stat : 0;
}

function getTotalStats(stats) {
  return stats.reduce((total, stat) => total + stat.base_stat, 0);
}

function buildRows(leftStats, rightStats) {
  const trackedStats = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

  const rows = trackedStats.map((statName) => {
    const leftValue = getStatValue(leftStats, statName);
    const rightValue = getStatValue(rightStats, statName);

    return {
      key: statName,
      label: formatLabel(statName),
      leftValue,
      rightValue,
      leftWinner: leftValue > rightValue,
      rightWinner: rightValue > leftValue,
    };
  });

  const leftTotal = getTotalStats(leftStats);
  const rightTotal = getTotalStats(rightStats);

  rows.push({
    key: 'total',
    label: 'Total Base Stats',
    leftValue: leftTotal,
    rightValue: rightTotal,
    leftWinner: leftTotal > rightTotal,
    rightWinner: rightTotal > leftTotal,
  });

  return rows;
}

function PokemonHeadCard({ pokemon, isReleasedInGo, showReleaseStatus, totalWinner }) {
  return (
    <Card className="compare-head-card">
      <Card.Body>
        <div className="compare-name-row">
          <h3>{formatLabel(pokemon.name)}</h3>
          {totalWinner ? <span className="compare-win-badge">Higher Total</span> : null}
        </div>
        <img
          className="compare-sprite"
          src={pokemon.sprites.front_default}
          alt={pokemon.name}
        />
        {showReleaseStatus ? (
          <span
            className={`go-status-pill ${isReleasedInGo ? 'go-status-pill-live' : 'go-status-pill-upcoming'}`}
          >
            {isReleasedInGo ? 'Released in Pokemon GO' : 'Not Released in Pokemon GO'}
          </span>
        ) : null}
        <div className="compare-types-row">
          {pokemon.types.map((typeInfo) => (
            <span className="type-pill" key={typeInfo.type.name}>
              {formatLabel(typeInfo.type.name)}
            </span>
          ))}
        </div>
      </Card.Body>
    </Card>
  );
}

function getTypeMultiplier(matrix, attackType, defenseType) {
  const attackMatrix = matrix?.[formatLabel(attackType)] || matrix?.[attackType] || {};
  const key = formatLabel(defenseType);
  return attackMatrix[key] ?? attackMatrix[defenseType] ?? 1;
}

function getIncomingMultiplier(matrix, defenderTypes, attackType) {
  return defenderTypes.reduce(
    (value, defenderType) => value * getTypeMultiplier(matrix, attackType, defenderType),
    1
  );
}

function getBestOffenseAgainst(matrix, attackerTypes, defenderTypes) {
  return attackerTypes.reduce((best, attackType) => {
    const value = getIncomingMultiplier(matrix, defenderTypes, attackType);
    return value > best ? value : best;
  }, 0);
}

function getWorstWeakness(matrix, defenderTypes) {
  return ALL_TYPES.reduce((worst, attackType) => {
    const value = getIncomingMultiplier(matrix, defenderTypes, attackType);
    return value > worst ? value : worst;
  }, 0);
}

function getResistanceCount(matrix, defenderTypes) {
  return ALL_TYPES.reduce((count, attackType) => {
    const value = getIncomingMultiplier(matrix, defenderTypes, attackType);
    return value < 1 ? count + 1 : count;
  }, 0);
}

function buildMatchupRows(matrix, leftTypes, rightTypes) {
  const leftBestOffense = getBestOffenseAgainst(matrix, leftTypes, rightTypes);
  const rightBestOffense = getBestOffenseAgainst(matrix, rightTypes, leftTypes);
  const leftWorstWeakness = getWorstWeakness(matrix, leftTypes);
  const rightWorstWeakness = getWorstWeakness(matrix, rightTypes);
  const leftResistanceCount = getResistanceCount(matrix, leftTypes);
  const rightResistanceCount = getResistanceCount(matrix, rightTypes);

  return [
    {
      key: 'best-offense',
      label: 'Best Hit Vs Opponent',
      leftValue: leftBestOffense,
      rightValue: rightBestOffense,
      leftWinner: leftBestOffense > rightBestOffense,
      rightWinner: rightBestOffense > leftBestOffense,
      valueType: 'multiplier',
    },
    {
      key: 'worst-weakness',
      label: 'Worst Incoming Weakness',
      leftValue: leftWorstWeakness,
      rightValue: rightWorstWeakness,
      leftWinner: leftWorstWeakness < rightWorstWeakness,
      rightWinner: rightWorstWeakness < leftWorstWeakness,
      valueType: 'multiplier',
    },
    {
      key: 'resistance-count',
      label: 'Resistances (<1x)',
      leftValue: leftResistanceCount,
      rightValue: rightResistanceCount,
      leftWinner: leftResistanceCount > rightResistanceCount,
      rightWinner: rightResistanceCount > leftResistanceCount,
      valueType: 'count',
    },
  ];
}

function formatCellValue(value, valueType) {
  if (valueType === 'multiplier') {
    return `${value.toFixed(3).replace(/\.0+$/, '').replace(/(\.[0-9]*?)0+$/, '$1')}x`;
  }

  return value;
}

export default function ComparePokemon(props) {
  const {
    left,
    right,
    releasedPokemonNames,
    showReleaseStatus,
    typeEffectiveness,
  } = props;
  const statRows = buildRows(left.stats, right.stats);
  const totalRow = statRows[statRows.length - 1];
  const leftTypes = left.types.map((typeInfo) => typeInfo.type.name.toLowerCase());
  const rightTypes = right.types.map((typeInfo) => typeInfo.type.name.toLowerCase());
  const matchupRows = typeEffectiveness
    ? buildMatchupRows(typeEffectiveness, leftTypes, rightTypes)
    : [];

  const leftMatchupWins = matchupRows.filter((row) => row.leftWinner).length;
  const rightMatchupWins = matchupRows.filter((row) => row.rightWinner).length;

  const leftVerdict = leftMatchupWins > rightMatchupWins;
  const rightVerdict = rightMatchupWins > leftMatchupWins;

  return (
    <Container className="compare-panel animate-in">
      <Row className="g-3">
        <Col xs={12} md={6}>
          <PokemonHeadCard
            pokemon={left}
            isReleasedInGo={releasedPokemonNames.has(left.name.toLowerCase())}
            showReleaseStatus={showReleaseStatus}
            totalWinner={totalRow.leftWinner}
          />
        </Col>
        <Col xs={12} md={6}>
          <PokemonHeadCard
            pokemon={right}
            isReleasedInGo={releasedPokemonNames.has(right.name.toLowerCase())}
            showReleaseStatus={showReleaseStatus}
            totalWinner={totalRow.rightWinner}
          />
        </Col>
      </Row>

      <Card className="compare-table-card mt-3">
        <Card.Body>
          <h4 className="section-heading">GO-Focused Stat Comparison</h4>
          <div className="compare-grid-head">
            <span>{formatLabel(left.name)}</span>
            <span>Stat</span>
            <span>{formatLabel(right.name)}</span>
          </div>
          {statRows.map((row) => (
            <div className="compare-grid-row" key={row.key}>
              <span className={`compare-value ${row.leftWinner ? 'compare-value-win' : ''}`}>
                {row.leftValue}
              </span>
              <span className="compare-label">{row.label}</span>
              <span className={`compare-value ${row.rightWinner ? 'compare-value-win' : ''}`}>
                {row.rightValue}
              </span>
            </div>
          ))}
        </Card.Body>
      </Card>

      {typeEffectiveness ? (
        <Card className="compare-table-card mt-3">
          <Card.Body>
            <div className="compare-type-heading-row">
              <h4 className="section-heading">Type Effectiveness Matchup</h4>
              {leftVerdict || rightVerdict ? (
                <span className="compare-win-badge">
                  {leftVerdict ? `${formatLabel(left.name)} Advantage` : `${formatLabel(right.name)} Advantage`}
                </span>
              ) : (
                <span className="compare-draw-badge">Even Matchup</span>
              )}
            </div>

            <div className="compare-grid-head">
              <span>{formatLabel(left.name)}</span>
              <span>Type Metric</span>
              <span>{formatLabel(right.name)}</span>
            </div>

            {matchupRows.map((row) => (
              <div className="compare-grid-row" key={row.key}>
                <span className={`compare-value ${row.leftWinner ? 'compare-value-win' : ''}`}>
                  {formatCellValue(row.leftValue, row.valueType)}
                </span>
                <span className="compare-label">{row.label}</span>
                <span className={`compare-value ${row.rightWinner ? 'compare-value-win' : ''}`}>
                  {formatCellValue(row.rightValue, row.valueType)}
                </span>
              </div>
            ))}
          </Card.Body>
        </Card>
      ) : null}
    </Container>
  );
}
