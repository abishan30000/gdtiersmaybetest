import React, { useState } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Header } from './Header';
import { useSecretTap } from '../hooks/useSecretTap';

function Harness() {
  const [loginOpen, setLoginOpen] = useState(false);
  const secret = useSecretTap({
    countNeeded: 7,
    windowSeconds: 3,
    onComplete: () => setLoginOpen(true)
  });

  return (
    <MemoryRouter>
      <Header
        title="Goober Dash Rankings"
        onIconClick={secret.tap}
        isAdmin={false}
        onLogout={() => {}}
        onToggleDebug={() => {}}
        showDebug={false}
      />
      {loginOpen ? <div>Admin Login</div> : null}
    </MemoryRouter>
  );
}

describe('secret tap login integration', () => {
  it('opens login after 7 icon presses within the configured window', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const icon = screen.getByRole('button', { name: /main site icon/i });
    for (let i = 0; i < 7; i++) {
      await user.click(icon);
    }

    expect(screen.getByText('Admin Login')).toBeInTheDocument();
  });
});
