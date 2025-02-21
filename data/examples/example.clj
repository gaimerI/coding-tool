(defn factorial [n]
  (if (<= n 1)
    1
    (* n (factorial (dec n)))))

;; Example usage:
(println (factorial 5))  ;; Output: 120
