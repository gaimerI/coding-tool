(module
  (func $factorial (param $n i32) (result i32)
    (if (result i32) (i32.eqz (get_local $n))
      (then (return (i32.const 1)))
    )
    (return (i32.mul (get_local $n) (call $factorial (i32.sub (get_local $n) (i32.const 1)))))
  )

  (export "factorial" (func $factorial))
)
