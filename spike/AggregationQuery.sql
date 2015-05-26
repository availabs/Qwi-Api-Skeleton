SELECT geography, sex, education, firmage, industry, SUM(hira) as sum_hira, SUM(sep) as sum_sep
FROM   se_fa_gc_ns_op_u
WHERE
    geo_level =  'S'    AND
    year      =   2005  AND
    quarter   =   4     AND
    sex       <> '0'    AND
    education <> 'E0'   AND
    firmage   <> '0'
GROUP BY geography, sex, education, firmage, industry
ORDER BY geography, sex, education, firmage, industry
;
