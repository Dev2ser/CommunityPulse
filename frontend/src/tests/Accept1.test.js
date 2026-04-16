/**
 * Acceptance Test: Community Pulse Frontend
 * Simulates a full user flow using React Testing Library.
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

// Mock API calls
jest.mock('../api/feedback', () => ({
  submitFeedback: jest.fn(() =>
    Promise.resolve({ id: 1, text: "We need more parks." })
  ),
  getTrends: jest.fn(() =>
    Promise.resolve({
      sentimentBreakdown: { positive: 10, negative: 2 },
      topKeywords: ["parks", "safety"]
    })
  )
}));

describe('Community Pulse Acceptance Tests', () => {

  test('User submits feedback and views confirmation', async () => {
    render(
      <MemoryRouter initialEntries={['/survey']}>
        <App />
      </MemoryRouter>
    );

    const input = screen.getByPlaceholderText(/share your thoughts/i);
    fireEvent.change(input, { target: { value: "We need more parks." } });

    const submitBtn = screen.getByRole('button', { name: /submit/i });
    fireEvent.click(submitBtn);

    const confirmation = await screen.findByText(/thank you for your feedback/i);
    expect(confirmation).toBeInTheDocument();
  });

  test('User navigates to results and sees trend data', async () => {
    render(
      <MemoryRouter initialEntries={['/results']}>
        <App />
      </MemoryRouter>
    );

    const sentimentHeader = await screen.findByText(/sentiment breakdown/i);
    expect(sentimentHeader).toBeInTheDocument();

    const keyword = await screen.findByText(/parks/i);
    expect(keyword).toBeInTheDocument();
  });

});
