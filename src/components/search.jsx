import React from 'react';
import { Form, Container, Col, Button, Row } from 'react-bootstrap';

export default function Search(props) {
  const [search, setSearch] = React.useState('');
  const [leftSearch, setLeftSearch] = React.useState('');
  const [rightSearch, setRightSearch] = React.useState('');
  const mode = props.mode || 'single';
  const suggestionList = (props.suggestions || []).slice(0, 150);

  const handleSubmit = (e) => {
    e.preventDefault();
    props.getPokemon(search.trim().toLowerCase());
  };

  const handleCompareSubmit = (e) => {
    e.preventDefault();
    props.getPokemonPair(
      leftSearch.trim().toLowerCase(),
      rightSearch.trim().toLowerCase()
    );
  };

  return (
    <Container className="search-wrap">
      <div className="mode-toggle-wrap" role="tablist" aria-label="Search mode">
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'single'}
          className={`mode-toggle-btn ${mode === 'single' ? 'mode-toggle-btn-active' : ''}`}
          onClick={() => props.onModeChange('single')}
        >
          Single
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === 'compare'}
          className={`mode-toggle-btn ${mode === 'compare' ? 'mode-toggle-btn-active' : ''}`}
          onClick={() => props.onModeChange('compare')}
        >
          Compare
        </button>
      </div>

      {mode === 'single' ? (
        <Form className="search-form" onSubmit={handleSubmit}>
          <Row className="align-items-center">
            <Col sm={9} className="my-1">
              <Form.Control
                className="search-input"
                list="pokemon-name-options"
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for a Pokemon"
                value={search}
              />
            </Col>
            <Col sm={3} className="my-1">
              <Button
                className="search-button"
                disabled={props.loading}
                type="submit"
              >
                {props.loading ? 'Searching...' : 'Search'}
              </Button>
            </Col>
          </Row>
        </Form>
      ) : (
        <Form className="search-form" onSubmit={handleCompareSubmit}>
          <Row className="align-items-center g-2">
            <Col xs={12} md={5}>
              <Form.Control
                className="search-input"
                list="pokemon-name-options"
                onChange={(e) => setLeftSearch(e.target.value)}
                placeholder="First Pokemon"
                value={leftSearch}
              />
            </Col>
            <Col xs={12} md={5}>
              <Form.Control
                className="search-input"
                list="pokemon-name-options"
                onChange={(e) => setRightSearch(e.target.value)}
                placeholder="Second Pokemon"
                value={rightSearch}
              />
            </Col>
            <Col xs={12} md={2}>
              <Button
                className="search-button"
                disabled={props.loading}
                type="submit"
              >
                {props.loading ? 'Comparing...' : 'Compare'}
              </Button>
            </Col>
          </Row>
        </Form>
      )}

      <datalist id="pokemon-name-options">
        {suggestionList.map((name) => (
          <option key={name} value={name} />
        ))}
      </datalist>
    </Container>
  );
}