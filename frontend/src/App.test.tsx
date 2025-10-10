import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

// Mock fetch for API calls
beforeEach(() => {
  window.fetch = jest.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve({ message: 'Hello World' }),
    })
  ) as unknown as typeof fetch;
});

// 1️⃣ Rendering Test
test('renders App component', () => {
  render(<App />);
  const element = screen.getByText(/learn react/i);
  expect(element).toBeInTheDocument();
});

// 2️⃣ User Interaction Test
test('button click increments counter', async () => {
  render(<App />);
  const button = screen.getByRole('button', { name: /increment/i });
  await userEvent.click(button);
  const counterText = screen.getByText(/count: 1/i);
  expect(counterText).toBeInTheDocument();
});

// 3️⃣ API Data Test
test('fetches and displays message from API', async () => {
  render(<App />);
  await waitFor(() => screen.getByText(/hello world/i));
  expect(screen.getByText(/hello world/i)).toBeInTheDocument();
});

// 4️⃣ Snapshot Test
test('matches snapshot', () => {
  const { asFragment } = render(<App />);
  expect(asFragment()).toMatchSnapshot();
});
