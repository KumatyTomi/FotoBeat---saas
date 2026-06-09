# FotoBeat.me — prompty rozwojowe

## Base44 prompt — landing + editor

Zbuduj aplikację SaaS FotoBeat.me. Aplikacja ma tworzyć filmy z paczki zdjęć i pliku MP3. Interfejs powinien mieć ciemny, premium, neonowy styl: cyberpunk, dark loft, złote akcenty, szkło, gradienty i motion feeling.

Ekrany:

1. Landing page z hasłem: "Wrzuć zdjęcia + muzykę. FotoBeat sam zrobi klip w rytm bitu."
2. Editor projektu z dwoma upload zone: zdjęcia oraz MP3.
3. Panel presetów efektów: Neon Pulse, Dark Loft Gold, Cyber Bloom, Family Story, Club Recap.
4. Timeline pokazujący automatycznie rozłożone zdjęcia względem beatów.
5. Panel eksportu 9:16, 16:9 i 1:1.
6. Panel projektów użytkownika.

Zachowanie MVP:

- po wrzuceniu zdjęć pokaż miniatury,
- po wrzuceniu MP3 pokaż nazwę pliku i mock BPM,
- wygeneruj automatyczny timeline,
- pozwól wybrać preset,
- symuluj kolejkę renderowania,
- pokaż przycisk pobrania MP4 jako mock.

## Prompt — generator efektów

Stwórz system presetów video dla FotoBeat.me. Każdy preset powinien mieć:

- nazwę,
- opis,
- tempo montażu,
- dominujące kolory,
- typy przejść,
- typy ruchu kamery,
- intensywność efektów,
- rekomendowane zastosowanie.

Presety: Neon Pulse, Dark Loft Gold, Cyber Bloom, Family Story, Club Recap, Wedding Story, Product Promo, Real Estate Walkthrough.

## Prompt — backend render worker

Zaprojektuj backend worker do renderowania MP4 z timeline JSON. Worker pobiera assets z storage, układa klipy według timeline, stosuje transformacje, przejścia, overlaye i audio, a następnie eksportuje MP4 przez FFmpeg. Uwzględnij kolejkę, retry, status, logi, timeout, limity planu i storage outputów.
