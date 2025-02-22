import chalk from 'chalk';

// פונקציה להפיכת טקסט לעברית ל-RTL
const toRTL = text => '\u2068\u2067' + text.split('').reverse().join('') + '\u2069';

process.stdin
  .setEncoding('utf8')
  .on('data', data => {
    const lines = data.split('\n');
    lines.forEach(line => {
      if (!line.trim()) return;
      
      if (line.startsWith('[')) {
        console.log(chalk.yellow(line));
      } else {
        console.log(toRTL(line.trim()));
      }
      console.log();
    });
  }); 