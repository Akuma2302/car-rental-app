# redux/

Not wired up yet — on purpose. This app's shared state is small (which car's
booking modal is open), so `src/context/BookingContext.jsx` handles it with
plain React Context instead. Context and Redux solve the same problem;
reaching for both would just be extra machinery for no benefit at this size.

If the app grows a shopping-cart-style flow, multi-step checkout, or several
independent slices of state that update frequently, that's the point where
moving from Context to a `configureStore()` + slices setup here starts to
pay for itself. Until then, this folder is kept as a placeholder so the
project structure has a clear, obvious home for it later.
