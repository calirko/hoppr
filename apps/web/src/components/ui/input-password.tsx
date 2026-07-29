import { EyeIcon, EyeSlashIcon } from '@phosphor-icons/react';
import type * as React from 'react';
import { useState } from 'react';
import { Button } from './button';
import { Input } from './input';

function InputPassword({ className, ...props }: React.ComponentProps<'input'>) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex">
      <Input
        type={showPassword ? 'text' : 'password'}
        className={className}
        style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
        {...props}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => setShowPassword((prev) => !prev)}
        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0, borderLeft: 0 }}
      >
        {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
      </Button>
    </div>
  );
}

export { InputPassword };
