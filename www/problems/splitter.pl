#!/usr/bin/perl -w
# 
#  Throw-away script to dump problem definitions out
#  of the database.
#
#  SELECT task_id, $task_name, task_details FROM tasks into outfile '/tmp/tasks.csv' FIELDS ESCAPED BY '' LINES TERMINATED BY '';
#

use strict;
use warnings;

@ARGV or die "Input file required as command-line parameter\n";

my $out;

while (<>) {
  if ( /(\d+)\t(.*?)\t(.*)/g ) {
    open $out, '>', "$1.xml" or die $!;
    select $out;
    chomp $3;
    $_=$3 . "\n<TaskName>$2</TaskName>";
  }
  s/\r\n$/\n/g;
  print $_ if $out;
}
