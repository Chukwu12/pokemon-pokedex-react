import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders pokedex hero title', () => {
  const { getByText } = render(<App />);
  const titleElement = getByText(/discover pokemon stats instantly/i);
  expect(titleElement).toBeInTheDocument();
});