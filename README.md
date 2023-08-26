# Redefine Health API
Using google apps script, I created a script that pulls data from a Flexiquiz account, sorts it, and then formats it.

Refine Health was spending 20-30 hours a month manually sorting data, and I reduced that time to less than a minute.

**Lessons Learned:**
- Google Apps Script language
- How to efficiently batch read/write to and from sheets, I refactored my code from 6 minute running time to less than 1 minute
- Using an API key on postman

**Optimizations:**
- Having less variables that are named the same or similarly, this can be confusing for others to read
- Making the code more modular
- More through unit testing to confirm that the code works perfectly
- Better ways to sort through dirty data
