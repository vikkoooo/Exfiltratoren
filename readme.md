### Exfiltratören

Yta 0x33 AB, ett hemlighetsfullt företag i rymdbranschen, misstänker att en av dess
anställda läcker känslig information till utomstående. Det är ett allvarligt
läge, då det finns indikationer på att medarbetaren är agent för en aktör som
planerar att genomföra ett inbrott på företaget. Analysera trafiken och försök
hitta vilken information som har exfiltrerats. 

Utmaningen innehåller flaggor på formen /flagga{[[:ascii:]]+}/. Kan du hitta
fler än två flaggor?

Skicka din lösning till rekrytering@fra.se. Lycka till!

### Lösningsförslag
## Paket 25: De är mig på spåren - jag går över till kamouflerad kommunikation. Vi hörs! 
Base64 meddelande i paketet: ZmxhZ2dhe2Z1bmN0aW9uYWxfdHJlc2hvbGRfcG93ZXJ9

Om vi decodar base64 strängen får vi meddelandet:
flagga{functional_treshold_power}


## Paket 152 innehåller en pdf, "presentkort".
Presentkortet innehåller en qr kod med följande sträng:

7GHE+98T16D3000D00+B9US8000G20000Q00V50000T204DF-WV0002P0MB8Z98.30Y3IY+VKS0000B44J692X9W208 4%20.UGP50000%20$ETR2033695066CD10W9JN00SAE.ONFQ7000PD0BN9%Q8RA0MKH:WK000I.00C9VW83FTLN1W/669SDRU000D50 B9TB8A63WSCZ3IWZ1S8C:0238G FWXDW/YOE62VU3TFVM8KEWJE62I-N7.A%RG02T.XQTOM4/B9%842AC*V+QLGGTR/JUEWZVTE6233W99J P6P5JUQREMN8/B8%8L06*2MINEE1K:57.2C79H.SLQ9938WFGW+BW/9HH:3AAGMFK3AS4TBZ-FF40H7KAQGJ4TS/9G VXIF3DG87G+0EH0ED$N0 QH0DNZ2EDVV$A8OR7AQ8YTY7V21OQJE./PIP6VPTL$7H7FPX18L0G9PW.CFXP0 BS3G0PE/991U08%3M2R4 FYSJJRLWSGFMUBGWQ%VF5G*:AV 0X02LDWTAW6CT+WVXCQQK26K6HTJ**4%ITBJ7000-00KVE98BGPCX9E EDZ+DQ7A5LE8QD8UC634F%6LF6E44PVDB3DPECHFEOECLFFUJC-QE3$FXOR1LU000GQ2MY85WEEECBWE-3EKH7 3EG/DPQEDLF410MD6GO7B.R0003X4MY86WEIEC*ZCXPCX C7WE510846$Q6%964W5EG6F466G7 W6GL6VK52A6646:909RI000$00KVE98B2VC7WEHH7V3EREDGDFNF6RF64W5Y96*96.SAPA7VW64G7%/67461G7P56JXJF/I000S10CY8WU8RH8+2

Tyvärr lyckas jag inte avkoda strängen, men jag tror att det kan vara en nyckel till något annat.

## Paket 310, top_secret.png
Strömmen indikerar att datan delas upp i chunks som en json fil. Så t.ex. paket 312-316 innehåller data som base64. Man behöver läsa den data som ligger under json filens "data" och sätta ihop det till en fil baserat på ix värdet, då ska png filen gå att återskapa. 

Har försökt genom att filtrera ut relevanta paket i WireShark, läsa den och bygga tillbaka datan, sedan transformera datan till en bild via js script. Tyvärr öppnas inte bilden. 
