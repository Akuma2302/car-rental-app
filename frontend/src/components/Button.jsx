const VARIANT_CLASS = {
  primary: 'btn btn-primary',
  ghost: 'btn btn-ghost',
  outline: 'btn btn-outline',
};

function Button({
  variant = 'primary',
  block = false,
  as = 'button',
  className = '',
  children,
  type,
  ...props
}) {
  const Tag = as;
  const classes = [VARIANT_CLASS[variant] || VARIANT_CLASS.primary, block ? 'btn-block' : '', className]
    .filter(Boolean)
    .join(' ');
  const resolvedType = as === 'button' ? type || 'button' : undefined;

  return (
    <Tag className={classes} type={resolvedType} {...props}>
      {children}
    </Tag>
  );
}

export default Button;
